import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import * as ExternalPlugin from "./.quartz/plugins"

ExternalPlugin.Explorer({
  filterFn: (node) => {
    const hiddenFolders = new Set([
      "Tools and Platforms",
      "People",
    ])

    return !hiddenFolders.has(node.displayName.toLowerCase())
  },
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()

