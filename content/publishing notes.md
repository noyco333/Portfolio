---
draft: true
unlisted: true
---
1.
check quartz.config.yaml for the "explicitpublish" plugin
turn on for public build
turn off for admissions build

2.
check quartz.config.yaml for configuration / baseUrl
set to noyco333.github.io/Portfolio for public build
set to noyco.net/portfolio for admissions build

3.
build to github (public)
`npx quartz sync --no-pull`

build to local (to noyco.net)
`npx quartz build --output private-site`

4. if links are broken, check https://quartz.jzhao.xyz/hosting?utm_source=chatgpt.com#using-nginx