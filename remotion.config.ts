import { Config } from '@remotion/cli/config'

Config.setVideoImageFormat('png')
Config.setOverwriteOutput(true)
Config.setConcurrency(2)
// Gold gradients band badly under the default GL renderer on some machines.
Config.setChromiumOpenGlRenderer('angle')
