---
outline: deep
---

# Preparation

The jktools is a private repo inside our GitLab. Which means that local environments need access to GitLab, to be able to install it.

### 1. Generate your GitLab Access Token

1. Head to GitLab, click your profile, then **Edit Profile**, then, from the sidebar, click on **Access Tokens**.

    [GitLab > Edit profile > Access Tokens](https://gitlab.com/-/profile/personal_access_tokens)

2. Set the **name** to `JKTOOLS_TOKEN`, and the **scope** to `read_api`.

3. Copy the generated token.


### 2. Setup your local environment

1. Open the config file for your shell (e.g. `~/.zshrc`).

2. Export the token:

    ```
    export JKTOOLS_TOKEN=<your_glpat_key>
    ```

### 3. Update the project

1. In every project which needs access to jktools, create a file called `.npmrc`, where you may define additional registries (such as the jktools package).

    ```
    @jktools:registry=https://gitlab.com/api/v4/projects/44176668/packages/npm/
    //gitlab.com/api/v4/projects/44176668/packages/npm/:_authToken="${JKTOOLS_TOKEN}"
    ```

2. Update the `build` section of the `.gitlab.ci.yml` config file to include the token as a build argument, to make sure it's also used when building & deploying the project:
    ```
    build:
      variables:
        BUILD_ARGS: "--build-arg JKTOOLS_TOKEN"
    ```

3. Optionally, if you use Docker, update `Dockerfile` to include
    ```
    ARG JKTOOLS_TOKEN
    ```


### 4. You're done 🎉
You may now install any part of jktools with `<npm/pnpm/yarn> i @teamnovu/kit-PACKAGE`. These instructions will be in every package.
