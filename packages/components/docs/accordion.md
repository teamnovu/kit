<script lang="ts" setup>
import { Accordion, AccordionItem, AccordionHeader, AccordionBody, HAccordion, HAccordionItem } from '@teamnovu/kit-components';
</script>

<style lang="scss" module>
.accordion {
  display: flex;
  flex-flow: column;
  row-gap: 1px;
  border: 1px solid var(--vp-custom-block-details-border);
  border-radius: .5rem;
  overflow: hidden;
  background: var(--vp-custom-block-details-border);
    
  .header {
    padding: 1rem;
    cursor: pointer;
    margin: 0;
    background: var(--vp-custom-block-details-bg);
    list-style-type: none;

    &::-webkit-details-marker {
      display:none;
    }

    &::before {
      content: "⏵";
      display: inline-block;
      margin-right: .5rem;
      transform: rotate(0);
      transition: transform .3s ease;
    }
    &[aria-expanded="true"]::before {
      transform: rotate(90deg);
    }
  }

  .content {
    border-top: 1px solid var(--vp-custom-block-details-border);
    padding: 1rem;
  }
}
</style>

# The Accordion component <Badge type="tip" text="Headless variant available" />

A simple headless accordion component wrapping the `useAccordion` composable.

## Contents

[[toc]]

## Props

```ts
interface Props {}
```

## AccordionItem

The component `AccordionItem` is just a tiny wrapper around the [Collapse component](./collapse.md) with
the `initially-closed` and `controlled` set to true by default.

## Examples


### Headless usage

::: details Code
```vue
<style lang="scss" module>
.accordion {
  display: flex;
  flex-flow: column;
  row-gap: 1px;
  border: 1px solid var(--vp-custom-block-details-border);
  border-radius: .5rem;
  overflow: hidden;
  background: var(--vp-custom-block-details-border);
    
  .header {
    padding: 1rem;
    cursor: pointer;
    margin: 0;
    background: var(--vp-custom-block-details-bg);
    list-style-type: none;

    &::before {
      content: "⏵";
      display: inline-block;
      margin-right: .5rem;
      transform: rotate(0);
      transition: transform .3s ease;
    }
    &[aria-expanded="true"]::before {
      transform: rotate(90deg);
    }
  }

  .content {
    border-top: 1px solid var(--vp-custom-block-details-border);
    padding: 1rem;
  }
}
</style>

```
<br />

```vue-html
<HAccordion>
  <div :class="$style.accordion">
    <HAccordionItem v-slot="{ ref, toggle, isOpen }" v-for="key in [1, 2, 3, 4, 5]">
      <article :key="key">
        <header :class="$style.header" @click="toggle" :aria-expanded="isOpen">
          Header {{ key }}
        </header>
        <section :ref="ref">
          <div :class="$style.content">
            Esse id ullamco ut deserunt deserunt pariatur culpa quis consectetur minim aliquip ipsum et. Nostrud aute voluptate ipsum do sint ad amet ipsum eiusmod dolore fugiat ea culpa aute. Occaecat esse adipisicing ipsum sit nisi occaecat occaecat esse aliquip do veniam laborum in. Qui ullamco quis fugiat elit sint non anim aliqua excepteur deserunt magna aute qui eu.
          </div>
        </section>
      </article>
    </HAccordionItem>
  </div>
</HAccordion>
```
:::

<HAccordion>
  <div :class="$style.accordion">
    <HAccordionItem v-slot="{ ref, toggle, isOpen }" v-for="key in [1, 2, 3, 4, 5]">
      <article :key="key">
        <header :class="$style.header" @click="toggle" :aria-expanded="isOpen">
          Header {{ key }}
        </header>
        <section :ref="ref">
          <div :class="$style.content">
            Esse id ullamco ut deserunt deserunt pariatur culpa quis consectetur minim aliquip ipsum et. Nostrud aute voluptate ipsum do sint ad amet ipsum eiusmod dolore fugiat ea culpa aute. Occaecat esse adipisicing ipsum sit nisi occaecat occaecat esse aliquip do veniam laborum in. Qui ullamco quis fugiat elit sint non anim aliqua excepteur deserunt magna aute qui eu.
          </div>
        </section>
      </article>
    </HAccordionItem>
  </div>
</HAccordion>

### Accessible usage

::: details Code
```vue
<style lang="scss" module>
.accordion {
  display: flex;
  flex-flow: column;
  row-gap: 1px;
  border: 1px solid var(--vp-custom-block-details-border);
  border-radius: .5rem;
  overflow: hidden;
  background: var(--vp-custom-block-details-border);

  .header {
    padding: 1rem;
    cursor: pointer;
    margin: 0;
    background: var(--vp-custom-block-details-bg);
    list-style-type: none;

    &::-webkit-details-marker {
      display:none;
    }

    &::before {
      content: "⏵";
      display: inline-block;
      margin-right: .5rem;
      transform: rotate(0);
      transition: transform .3s ease;
    }
    &[aria-expanded="true"]::before {
      transform: rotate(90deg);
    }
  }

  .content {
    border-top: 1px solid var(--vp-custom-block-details-border);
    padding: 1rem;
  }
}
</style>

```
<br />

```vue-html
<Accordion :class="$style.accordion">
  <AccordionItem v-for="key in [1, 2, 3, 4, 5]" :key="key">
    <AccordionHeader :class="$style.header">
      Header {{ key }}
    </AccordionHeader>
    <AccordionBody>
      <div :class="$style.content">
        Esse id ullamco ut deserunt deserunt pariatur culpa quis consectetur minim aliquip ipsum et. Nostrud aute voluptate ipsum do sint ad amet ipsum eiusmod dolore fugiat ea culpa aute. Occaecat esse adipisicing ipsum sit nisi occaecat occaecat esse aliquip do veniam laborum in. Qui ullamco quis fugiat elit sint non anim aliqua excepteur deserunt magna aute qui eu.
      </div>
    </AccordionBody>
  </AccordionItem>
</Accordion>
```
:::


<Accordion :class="$style.accordion">
  <AccordionItem v-for="key in [1, 2, 3, 4, 5]" :key="key">
    <AccordionHeader :class="$style.header">
      Header {{ key }}
    </AccordionHeader>
    <AccordionBody>
      <div :class="$style.content">
        Esse id ullamco ut deserunt deserunt pariatur culpa quis consectetur minim aliquip ipsum et. Nostrud aute voluptate ipsum do sint ad amet ipsum eiusmod dolore fugiat ea culpa aute. Occaecat esse adipisicing ipsum sit nisi occaecat occaecat esse aliquip do veniam laborum in. Qui ullamco quis fugiat elit sint non anim aliqua excepteur deserunt magna aute qui eu.
      </div>
    </AccordionBody>
  </AccordionItem>
</Accordion>
