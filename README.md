# frontend-modules

A registry of plug-and-play feature modules for the [nextjs-base-repo](https://github.com/kamran9d/nextjs-base-repo). Each module is installed with a single command and wired into the app automatically.

## How to install a module (consumer)

Inside a project cloned from `nextjs-base-repo`:

```bash
pnpm add-module <module-name>
```

See the base repo README for the full list of available modules and their APIs.

---

## How to create a new module

A module is a self-contained directory with two things:

```
<module-name>/
├── manifest.json
└── files/
    └── src/
        └── ...   ← copied verbatim into the consumer project's src/
```

### Step 1 — Create the directory

Name it exactly as users will reference it in `pnpm add-module <module-name>`.

```
frontend-modules/
└── my-module/
    ├── manifest.json
    └── files/
```

### Step 2 — Write the source files

Place everything inside `files/src/`. The `add-module` script copies `files/` directly into the consumer project root, so `files/src/foo.ts` lands at `src/foo.ts`.

Follow the directory conventions from the base repo:

| What | Where |
|---|---|
| TypeScript types and interfaces | `src/types/` |
| Third-party SDK setup / wrappers | `src/lib/` |
| API calls and external integrations | `src/services/` |
| React Contexts | `src/contexts/` |
| **Provider component (required for registry)** | `src/providers/AuthProvider.tsx` |
| Reusable React hooks | `src/hooks/` |
| Shared UI components | `src/components/` |

> The provider file at `src/providers/AuthProvider.tsx` is the entry point the module registry imports. It must export a component named `AuthProvider` that accepts `{ children: React.ReactNode }`.

### Step 3 — Write `manifest.json`

```json
{
  "name": "my-module",
  "category": "auth",
  "dependencies": ["some-package", "another-package"],
  "registryInjection": {
    "import": "import { AuthProvider } from '@/providers/AuthProvider';",
    "componentName": "AuthProvider"
  }
}
```

| Field | Description |
|---|---|
| `name` | Must match the directory name |
| `category` | Logical group this module belongs to (e.g. `"auth"`). Only one module per category can be installed at a time. Omit only for modules that have no mutual exclusion concern |
| `dependencies` | npm packages the `add-module` script will install. Use `[]` if none |
| `registryInjection.import` | The exact import statement injected at the top of `registry.ts` |
| `registryInjection.componentName` | The component name inserted into the `registeredProviders` array |

#### Why `category` matters

The `add-module` script tracks installed modules in `src/.modules.json`. When a developer runs `pnpm add-module auth-firebase` but already has `auth-custom` installed, the script detects the `"auth"` category conflict and asks a single yes/no question:

- **y** — copy the new module's files into `src/` (nothing is deleted, registry is untouched, old provider stays active). The developer switches providers manually when ready.
- **n** — do nothing, exit cleanly.

There are no destructive operations. In CI (non-TTY), the prompt is skipped and the install aborts. Without `category`, no conflict check runs.

### Step 4 — Verify the injection target

The `add-module` script searches `src/providers/registry.ts` for the comment `// INSERT_POINT` and inserts `<componentName>,` above it. Make sure the base repo's registry file contains that comment before testing.

```ts
export const registeredProviders: React.ComponentType<{ children: React.ReactNode }>[] = [
    // INSERT_POINT   ← your component is inserted here
];
```

### Step 5 — Test locally

You can test without pushing to GitHub by temporarily editing the `repoPath` in `src/scripts/add-module.mjs` to point at a local path, or by manually running the copy and checking that registry injection works.

---

## Module anatomy — reference example

Below is the full structure used by both `auth-custom` and `auth-firebase` as a reference pattern:

```
auth-firebase/
├── manifest.json
└── files/
    └── src/
        ├── types/
        │   └── auth.ts            # User, credentials, and context interfaces
        ├── lib/
        │   └── firebase.ts        # SDK singleton initialisation
        ├── services/
        │   └── auth.service.ts    # Thin wrappers over SDK / API calls
        ├── contexts/
        │   └── AuthContext.tsx    # createContext + Provider implementation
        ├── providers/
        │   └── AuthProvider.tsx   # Re-exports the provider for the registry
        └── hooks/
            └── useAuth.ts         # useAuth() consumer hook
```

### `manifest.json`

```json
{
  "name": "auth-firebase",
  "dependencies": ["firebase"],
  "registryInjection": {
    "import": "import { AuthProvider } from '@/providers/AuthProvider';",
    "componentName": "AuthProvider"
  }
}
```

### `providers/AuthProvider.tsx`

```ts
"use client";
export { AuthContextProvider as AuthProvider } from '@/contexts/AuthContext';
```

### `hooks/useAuth.ts`

```ts
"use client";
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import type { AuthContextType } from '@/types/auth';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
```

---

## Existing modules

| Module | Description |
|---|---|
| [`auth-custom`](./auth-custom/) | JWT auth via your own backend API (email/password + Google OAuth redirect) |
| [`auth-firebase`](./auth-firebase/) | Firebase Auth (email/password, Google popup, GitHub popup, password reset) |

---

## Rules

- Keep modules **self-contained** — no cross-module imports.
- Do not hardcode values. Use `process.env.NEXT_PUBLIC_*` for config and document every required env var in the base repo README.
- Match the base repo's TypeScript strictness. No `any`.
- One module = one `registryInjection` entry. If a module needs multiple providers, compose them inside a single wrapper component.
