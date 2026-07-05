# @ohif/extension-dental

Dental SaaS customization extension for OHIF Viewer.

## Modules

| Module | Purpose |
|--------|---------|
| `layoutTemplateModule.dentalViewerLayout` | Practice Header layout |
| `hangingProtocolModule.@ohif/hpDental2x2` | 2×2 dental grid |
| `panelModule.dentalMeasurements` | Measurements list panel |
| `toolbarModule.dental.measurementsPalette` | Measurements palette button |
| `commandsModule` | Preset tools, JSON export, state load |
| `customizationModule.dental` | Theme and measurement labels |

## Development

```bash
pnpm run dev
```

Build from monorepo root:

```bash
cd app/web/Viewers
pnpm run build
```
