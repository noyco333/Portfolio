May 20th 2026

*tools: [[Unity]], [[Cluster]]*

I've made a lot of worlds in the metaverse platform [[Cluster]], and one of the things I care about is accessibility for mobile users. Large download sizes are usually a bottleneck. As of now, Cluster only displays the total world size in megabytes and does not provide any way to analyze the file further. I came up with this workaround that effectively decompiles the compiled world to help me diagnose the file to see what assets are taking up the most space. It's scrappy, but it beats guessing and checking.

1. Locate temporary builds (usually in the *UserName*/AppData/Local/Temp/*CompanyName*/*ProjectName*)![[Pasted image 20260520131229.png]]
2. Analyze via [[AssetRipper]]![[Pasted image 20260520131203.png|531]]
3. Export project files![[Pasted image 20260520131250.png]]
4. Analyze project file with WizTree![[Pasted image 20260520131129.png]]