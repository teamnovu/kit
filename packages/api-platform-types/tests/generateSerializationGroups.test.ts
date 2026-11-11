import fs from 'node:fs/promises'
import path from 'node:path'
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import type { GenerateSerializationGroupsPluginOptions } from '../src/index'
import {
  buildStart, createWorkspace, hotUpdate, parseGenerated, syntaxErrors, yaml,
} from './helpers'

type ResourceModifier = NonNullable<GenerateSerializationGroupsPluginOptions['modifyResourceSerializationPropertyDefinition']>
type OperationModifier = NonNullable<GenerateSerializationGroupsPluginOptions['modifyOperationSerializationPropertyDefinition']>

let workspace: Awaited<ReturnType<typeof createWorkspace>>

beforeEach(async () => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  workspace = await createWorkspace()
})

afterEach(async () => {
  vi.restoreAllMocks()
  await workspace.remove()
})

async function generate(options: Partial<GenerateSerializationGroupsPluginOptions> = {}) {
  await buildStart(workspace.createPlugin(options))

  return {
    resources: parseGenerated(await workspace.read('resourceSerializationGroups.ts')),
    operations: parseGenerated(await workspace.read('operations.ts')),
  }
}

const librarySerialization = yaml`
  App\Entity\Book:
    attributes:
      id:
        groups: ['book:read']
      title:
        groups:
          - book:read
          - book:write
      authorName:
        serialized_name: author
        groups: ['book:read']
      publishedAt:
        serializedName: published_at
        groups: ['book:read', 'book:write']
      internalNote:
        max_depth: 1
  App\Entity\Author:
    attributes:
      name:
        groups: ['author:read', 'book:read']
  App\Entity\Audit:
    attributes:
      createdBy:
        groups: []
  App\Entity\Animal:
    discriminator_map:
      type_property: type
      mapping:
        dog: App\Entity\Dog
`

const libraryMapping = yaml`
  resources:
    App\Entity\Book:
      shortName: Publication
      normalizationContext:
        groups: ['book:read']
      denormalizationContext:
        groups: ['book:write']
      operations:
        ApiPlatform\Metadata\GetCollection: ~
        ApiPlatform\Metadata\Get: null
        ApiPlatform\Metadata\Post:
        ApiPlatform\Metadata\Put:
          denormalizationContext:
            groups: ['book:replace']
        ApiPlatform\Metadata\Patch:
          normalizationContext:
            groups: ['book:read', 'book:detail']
        book_publish:
          class: ApiPlatform\Metadata\Post
          name: publish
          denormalizationContext:
            groups: ['book:publish']
    App\Entity\Review:
      operations:
        ApiPlatform\Metadata\Get:
          name: review_get
          normalizationContext:
            groups: ['review:read']
        ApiPlatform\Metadata\Delete: ~
    App\Entity\Tag:
      operations:
        ApiPlatform\Metadata\Get: ~
`

const bookSerialization = yaml`
  App\Entity\Book:
    attributes:
      title:
        groups: ['book:read']
`

const authorSerialization = yaml`
  App\Entity\Author:
    attributes:
      name:
        groups: ['author:read']
`

const bookMapping = yaml`
  resources:
    App\Entity\Book:
      operations:
        ApiPlatform\Metadata\Get:
          normalizationContext:
            groups: ['book:read']
`

const reviewMapping = yaml`
  resources:
    App\Entity\Review:
      operations:
        ApiPlatform\Metadata\Get:
          normalizationContext:
            groups: ['review:read']
`

describe('generateSerializationGroups', () => {
  describe('buildStart', () => {
    it('watches both input directories and writes both files into a new output directory', async () => {
      await workspace.writeSerialization('Book.yaml', bookSerialization)
      await workspace.writeMapping('Book.yaml', bookMapping)

      const context = await buildStart(workspace.createPlugin())

      expect(context.addWatchFile.mock.calls).toEqual([
        [workspace.serializationFileDirectory],
        [workspace.mappingFileDirectory],
      ])
      expect((await fs.readdir(workspace.outputDirectory)).sort()).toEqual(['operations.ts', 'resourceSerializationGroups.ts'])
    })

    it('prints the resource serialization groups', async () => {
      await workspace.writeSerialization('Library.yaml', librarySerialization)
      await workspace.writeMapping('Library.yaml', libraryMapping)

      await buildStart(workspace.createPlugin())
      const output = await workspace.read('resourceSerializationGroups.ts')

      expect(syntaxErrors(output)).toEqual([])
      await expect(output).toMatchFileSnapshot('./__snapshots__/generateSerializationGroups/resourceSerializationGroups.ts.snap')
    })

    it('prints the operations', async () => {
      await workspace.writeSerialization('Library.yaml', librarySerialization)
      await workspace.writeMapping('Library.yaml', libraryMapping)

      await buildStart(workspace.createPlugin())
      const output = await workspace.read('operations.ts')

      expect(syntaxErrors(output)).toEqual([])
      await expect(output).toMatchFileSnapshot('./__snapshots__/generateSerializationGroups/operations.ts.snap')
    })
  })

  describe('resource serialization groups', () => {
    it('names each property by serialized_name or serializedName, else by the attribute', async () => {
      await workspace.writeSerialization('Library.yaml', librarySerialization)

      const { resources } = await generate()

      expect(resources.BookSerializationGroups).toEqual({
        resourceClass: 'App\\Entity\\Book',
        properties: {
          id: { groups: ['book:read'] },
          title: { groups: ['book:read', 'book:write'] },
          author: { groups: ['book:read'] },
          published_at: { groups: ['book:read', 'book:write'] },
        },
      })
    })

    it('skips attributes without groups and resources without grouped attributes', async () => {
      await workspace.writeSerialization('Library.yaml', librarySerialization)

      const { resources } = await generate()

      expect(Object.keys(resources)).toEqual(['BookSerializationGroups', 'AuthorSerializationGroups'])
      expect(resources.BookSerializationGroups).not.toHaveProperty('properties.internalNote')
    })

    it('reads .yaml and .yml files from nested directories and nothing else', async () => {
      await workspace.writeSerialization('Book.yaml', bookSerialization)
      await workspace.writeSerialization('nested/deeper/Author.yml', authorSerialization)
      await workspace.writeSerialization('nested/notes.txt', yaml`
        App\Entity\Ignored:
          attributes:
            name:
              groups: ['ignored:read']
      `)

      const { resources } = await generate()

      expect(Object.keys(resources).sort()).toEqual(['AuthorSerializationGroups', 'BookSerializationGroups'])
      expect(resources.AuthorSerializationGroups).toEqual({
        resourceClass: 'App\\Entity\\Author',
        properties: { name: { groups: ['author:read'] } },
      })
    })
  })

  describe('operations', () => {
    it('reads operations declared as null, ~ or an empty value', async () => {
      await workspace.writeMapping('Book.yaml', yaml`
        resources:
          App\Entity\Book:
            normalizationContext:
              groups: ['book:read']
            operations:
              ApiPlatform\Metadata\GetCollection: ~
              ApiPlatform\Metadata\Get: null
              ApiPlatform\Metadata\Post:
      `)

      const { operations } = await generate()

      expect(operations.BookOperations).toEqual({
        resourceClass: 'App\\Entity\\Book',
        type: 'Book',
        operations: {
          GetCollection: { output: { groups: ['book:read'] } },
          Get: { output: { groups: ['book:read'] } },
          Post: { output: { groups: ['book:read'] } },
        },
      })
    })

    it('gives input groups only to Patch, Post and Put operations', async () => {
      await workspace.writeMapping('Book.yaml', yaml`
        resources:
          App\Entity\Book:
            normalizationContext:
              groups: ['book:read']
            denormalizationContext:
              groups: ['book:write']
            operations:
              ApiPlatform\Metadata\Get: ~
              ApiPlatform\Metadata\GetCollection: ~
              ApiPlatform\Metadata\Post: ~
              ApiPlatform\Metadata\Put: ~
              ApiPlatform\Metadata\Patch: ~
              book_preview:
                class: ApiPlatform\Metadata\Get
                denormalizationContext:
                  groups: ['book:preview']
              book_import:
                class: ApiPlatform\Metadata\Post
      `)

      const { operations } = await generate()
      const read = { groups: ['book:read'] }
      const write = { groups: ['book:write'] }

      expect(operations.BookOperations).toHaveProperty('operations', {
        Get: { output: read },
        GetCollection: { output: read },
        Post: {
          input: write,
          output: read,
        },
        Put: {
          input: write,
          output: read,
        },
        Patch: {
          input: write,
          output: read,
        },
        book_preview: { output: read },
        book_import: {
          input: write,
          output: read,
        },
      })
    })

    it('falls back to the resource-level groups for operations without their own', async () => {
      await workspace.writeMapping('Book.yaml', yaml`
        resources:
          App\Entity\Book:
            normalizationContext:
              groups: ['book:read']
            denormalizationContext:
              groups: ['book:write']
            operations:
              ApiPlatform\Metadata\Get: ~
              ApiPlatform\Metadata\GetCollection:
                normalizationContext:
                  groups: ['book:list']
              ApiPlatform\Metadata\Patch:
                denormalizationContext:
                  groups: ['book:patch']
      `)

      const { operations } = await generate()

      expect(operations.BookOperations).toHaveProperty('operations', {
        Get: { output: { groups: ['book:read'] } },
        GetCollection: { output: { groups: ['book:list'] } },
        Patch: {
          input: { groups: ['book:patch'] },
          output: { groups: ['book:read'] },
        },
      })
    })

    it('names operations by name, else by the key without the ApiPlatform\\Metadata namespace', async () => {
      await workspace.writeMapping('Book.yaml', yaml`
        resources:
          App\Entity\Book:
            normalizationContext:
              groups: ['book:read']
            operations:
              ApiPlatform\Metadata\GetCollection: ~
              ApiPlatform\Metadata\Get:
                name: book_get
              book_archive:
                class: ApiPlatform\Metadata\Patch
              book_publish:
                class: ApiPlatform\Metadata\Post
                name: publish
      `)

      const { operations } = await generate()

      expect(Object.keys((operations.BookOperations as { operations: object }).operations)).toEqual([
        'GetCollection',
        'book_get',
        'book_archive',
        'publish',
      ])
    })

    it('uses shortName as the type and falls back to the class name', async () => {
      await workspace.writeMapping('Library.yaml', yaml`
        resources:
          App\Entity\Book:
            shortName: Publication
            normalizationContext:
              groups: ['book:read']
            operations:
              ApiPlatform\Metadata\Get: ~
          App\Entity\Library\Shelf:
            normalizationContext:
              groups: ['shelf:read']
            operations:
              ApiPlatform\Metadata\Get: ~
      `)

      const { operations } = await generate()

      expect(operations.BookOperations).toMatchObject({
        resourceClass: 'App\\Entity\\Book',
        type: 'Publication',
      })
      expect(operations.ShelfOperations).toMatchObject({
        resourceClass: 'App\\Entity\\Library\\Shelf',
        type: 'Shelf',
      })
      expect(operations.OperationsUnionType).toEqual(['BookOperations', 'ShelfOperations'])
    })

    it('skips operations and resources without any groups', async () => {
      await workspace.writeMapping('Library.yaml', yaml`
        resources:
          App\Entity\Review:
            operations:
              ApiPlatform\Metadata\Get:
                normalizationContext:
                  groups: ['review:read']
              ApiPlatform\Metadata\Delete: ~
          App\Entity\Tag:
            operations:
              ApiPlatform\Metadata\Get: ~
              ApiPlatform\Metadata\Post: ~
      `)

      const { operations } = await generate()

      expect(operations).toEqual({
        ReviewOperations: {
          resourceClass: 'App\\Entity\\Review',
          type: 'Review',
          operations: { Get: { output: { groups: ['review:read'] } } },
        },
        OperationsUnionType: ['ReviewOperations'],
      })
    })

    it('reads .yaml and .yml files from nested directories and nothing else', async () => {
      await workspace.writeMapping('Book.yaml', bookMapping)
      await workspace.writeMapping('nested/deeper/Review.yml', reviewMapping)
      await workspace.writeMapping('nested/README.md', yaml`
        resources:
          App\Entity\Ignored:
            operations:
              ApiPlatform\Metadata\Get:
                normalizationContext:
                  groups: ['ignored:read']
      `)

      const { operations } = await generate()

      expect(Object.keys(operations).sort()).toEqual(['BookOperations', 'OperationsUnionType', 'ReviewOperations'])
      expect((operations.OperationsUnionType as string[]).sort()).toEqual(['BookOperations', 'ReviewOperations'])
    })

    it('still writes both files when there are no resources at all', async () => {
      await buildStart(workspace.createPlugin())

      expect(await workspace.read('resourceSerializationGroups.ts')).toBe('')
      const operations = await workspace.read('operations.ts')
      expect(operations).toMatch(/^export type OperationsUnionType\b/)
      expect(operations).not.toContain('interface')
    })
  })

  describe('modifier callbacks', () => {
    it('writes what modifyResourceSerializationPropertyDefinition returns for each property', async () => {
      await workspace.writeSerialization('Book.yaml', yaml`
        App\Entity\Book:
          attributes:
            title:
              groups: ['book:read']
            authorName:
              serialized_name: author
              groups: ['book:read', 'book:write']
      `)
      const modify = vi.fn<ResourceModifier>(definition => ({
        ...definition,
        groups: [...definition.groups, ...definition.groups.map(group => `role_admin:${group}`)],
      }))

      const { resources } = await generate({ modifyResourceSerializationPropertyDefinition: modify })

      expect(modify.mock.calls.map(([definition]) => definition)).toEqual([
        {
          name: 'title',
          groups: ['book:read'],
        },
        {
          name: 'author',
          groups: ['book:read', 'book:write'],
        },
      ])
      expect(resources.BookSerializationGroups).toHaveProperty('properties', {
        title: { groups: ['book:read', 'role_admin:book:read'] },
        author: { groups: ['book:read', 'book:write', 'role_admin:book:read', 'role_admin:book:write'] },
      })
    })

    it('writes what modifyOperationSerializationPropertyDefinition returns for each operation', async () => {
      await workspace.writeMapping('Book.yaml', yaml`
        resources:
          App\Entity\Book:
            normalizationContext:
              groups: ['book:read']
            denormalizationContext:
              groups: ['book:write']
            operations:
              ApiPlatform\Metadata\Get: ~
              ApiPlatform\Metadata\Post: ~
      `)
      const modify = vi.fn<OperationModifier>(definition => ({
        ...definition,
        outputGroups: definition.outputGroups.concat(definition.outputGroups.map(group => `role_admin:${group}`)),
      }))

      const { operations } = await generate({ modifyOperationSerializationPropertyDefinition: modify })

      expect(modify.mock.calls.map(([definition]) => definition)).toEqual([
        {
          operationName: 'Get',
          inputGroups: null,
          outputGroups: ['book:read'],
        },
        {
          operationName: 'Post',
          inputGroups: ['book:write'],
          outputGroups: ['book:read'],
        },
      ])
      expect(operations.BookOperations).toHaveProperty('operations', {
        Get: { output: { groups: ['book:read', 'role_admin:book:read'] } },
        Post: {
          input: { groups: ['book:write'] },
          output: { groups: ['book:read', 'role_admin:book:read'] },
        },
      })
    })
  })

  describe('handleHotUpdate', () => {
    async function startWithBook() {
      await workspace.writeSerialization('Book.yaml', bookSerialization)
      await workspace.writeMapping('Book.yaml', bookMapping)
      const plugin = workspace.createPlugin()
      await buildStart(plugin)

      return {
        plugin,
        resources: await workspace.read('resourceSerializationGroups.ts'),
        operations: await workspace.read('operations.ts'),
      }
    }

    it('regenerates only the resource groups when a serialization file changes', async () => {
      const before = await startWithBook()
      const changed = await workspace.writeSerialization('nested/Author.yml', authorSerialization)
      await workspace.writeMapping('Review.yaml', reviewMapping)

      await hotUpdate(before.plugin, changed)

      const resources = parseGenerated(await workspace.read('resourceSerializationGroups.ts'))
      expect(Object.keys(resources).sort()).toEqual(['AuthorSerializationGroups', 'BookSerializationGroups'])
      expect(await workspace.read('operations.ts')).toBe(before.operations)
    })

    it('regenerates only the operations when a mapping file changes', async () => {
      const before = await startWithBook()
      await workspace.writeSerialization('Author.yaml', authorSerialization)
      const changed = await workspace.writeMapping('nested/Review.yml', reviewMapping)

      await hotUpdate(before.plugin, changed)

      const operations = parseGenerated(await workspace.read('operations.ts'))
      expect((operations.OperationsUnionType as string[]).sort()).toEqual(['BookOperations', 'ReviewOperations'])
      expect(await workspace.read('resourceSerializationGroups.ts')).toBe(before.resources)
    })

    it('ignores files outside the watched directories', async () => {
      const before = await startWithBook()
      await workspace.writeSerialization('Author.yaml', authorSerialization)
      await workspace.writeMapping('Review.yaml', reviewMapping)

      await hotUpdate(before.plugin, path.join(workspace.root, 'frontend', 'src', 'App.vue'))

      expect(await workspace.read('resourceSerializationGroups.ts')).toBe(before.resources)
      expect(await workspace.read('operations.ts')).toBe(before.operations)
    })
  })
})
