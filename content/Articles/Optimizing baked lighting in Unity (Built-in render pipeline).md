2026 May 21

*tools: [[Unity]], [[Cluster]]*
*project: [[8LEGS DINER]]*

The default Unity settings for lighting can be suboptimal in many cases. These are some settings I found to be crucial for baked lighting that's quick, good-looking and compact in memory and storage.

![[Pasted image 20260521192519.png]]
![[Pasted image 20260521193958.png]]

Below is a screenshot of the Unity's lighting tab:
![[Pasted image 20260521192557.png|368]]
From the top:
- Turn off "Realtime Lighting / Realtime Global Illumination" if not using Enlighten / some form of realtime GI. It can extend baking times to 10+ minutes for a scene that can be baked in under one minute otherwise.
- Set "Lightmapping Settings / Lightmapper" to "Progressive GPU (Preview)." Speeds up baking significantly if the device has a dedicated GPU with little to no visible degradation compared to CPU baking.
- Set "Lightmapping Settings / Lightmapper / Filtering" to "Advanced." Provides options to denoise and blur baked lightmaps. Adjust if the resulting lightmap is too noisy or blurry.
- Adjust "Lightmapping Settings / Lightmap Resolution" while looking at the baked lightmap resolution in the scene using debug scene view. ![[Pasted image 20260521193737.png|617]]
  The default 40 texels / unit is usually a bit overkill for mobile (though its a good idea to bake in high resolution and then downscale /compress later)
- "Lightmapping Settings / Lightmap Padding" was a bit misleading. In my case the extremely large and wasteful lightmap padding was dictated by the auto-generated lightmap UV upon importing the 3d models.
  ![[Pasted image 20260521194607.png]]
	- When importing a 3D model and generating lightmap UVs, set "Lightmap UV settings / Margin Method" to "Manual." Then make the pack margin reasonably small (2~10 px?)as to not make lightmap UV islands to bleed into each other but still allow the UV to be compact.
- Set "Lightmapping Settings / Max Lightmap Size" to the largest resolution available. Lowering it is usually not a good idea because:
	- The lightmapper's resolution is dictated by "Lightmapping Settings / Lightmap Resolution" and each individual mesh renderer's "Lightmapping / Scale in Lightmap". If the lightmapper doesn't have enough space within "Lightmapping Settings / Max Lightmap" size, it will simply generate multiple lightmap textures at that size. Fragmenting the lightmap in this way is only useful if they are meant to be streamed (loaded in and out) in pieces to save memory, and makes rendering slightly slower and texture compression less efficient. In my case, the fragmentation also prevented the lightmapper from generating an appropriately large UV island for larger meshes like the ceiling, causing a jarring mismatch of resolution between meshes.

![[Pasted image 20260521192519.png]]

Some miscellaneous tips:
- Placing light probes optimally is a complicated science... (unless you have a paid asset to do that for you, which I don't) but it can allow you to remove smaller static props from the lightmap and save a lot of bake time.![[Pasted image 20260521201723.png]]
	- Don't place light probes inside of geometry where it might not get any light, because dynamic objects approaching that point will look unnaturally dark.
	- Place light probes right next to walls on both sides, around corners, and otherwise any place where the lighting condition would change dynamically over small distances.
	- Make sure there is a layer of "outside" light probes because apparently objects that are reasonably far away from any light probe will still be affected by the nearest light probe.
	- To minimize the amount of blending needed, Unity will only look at 4 nearest probes for each dynamic mesh renderer. The pink lines in the gizmos are
- Adjust each static mesh renderer's "Lightmapping / Scale in Lightmap" (e.g. 0.1 for the landscape around the buildings, 2 for important but small and complex meshes like these diner seats and tables, 1 for everything else)
	- Setting the value to 0 makes it not have a lightmap itself, but contribute to it. Use for things like emissive billboards or surrounding scenery that doesn't really need a lightmap itself but needs to cast shadows, emit and bounce light while baking.

Doing all this made the baked lightmap in [[8LEGS DINER]] to shrink from 30 MB to < 5MB and visually increased resolution by about 4x. The entire thing is now a single 2048x texture that can be reduced to 512x for mobile and VR platforms and still look decent.

![[Lightmap-0_comp_light.jpg]]
![[Pasted image 20260521200641.png]]
