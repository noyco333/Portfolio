![[full_light.png]]

July 2021 ~

*tools: [[Unity]], [[Blender]], [[OpenXR]], [[Steam]]

https://store.steampowered.com/app/2368780/Drift_Abyss/

Drift Abyss is a VR project that lets users explore an infinitely large surreal landscape that is unique to each run. The goal of the project was to translate the beauty of procedural generation into an immersive and easily navigable format so people who aren't algorithm nerds can experience it too.
# Development History
## 1. Discovering the Marching Cubes algorithm
I initially learned about procedural terrain generation in video games through [[Minecraft]]. However, my eyes were opened when I came across [a YouTube video from Sebastian Lague](https://youtu.be/_eVpf6hItuw) that showcased the [marching cubes algorithm](https://en.wikipedia.org/wiki/Marching_cubes) which, unlike Minecraft, could generate intricate meshes without looking blocky. Given enough resolution, it could turn just about any 3D equation or volume data into solid mesh that a player might walk on.

I made my first prototype of infinite 3D terrain in [[Unity]].
![[DADH0.mp4]]

## 2. Playing with gradient noise
The shape of the terrain is dictated with a 3D volume array. It's contents are generated with a combination of gradient noise algorithms, such as [Perlin noise](https://en.wikipedia.org/wiki/Perlin_noise). Though Perlin noise is infinite and non-repeating in theory, it is too featureless on its own to generate any distinct landmarks.
![[DADH5 1.mp4]]
To make the world more interesting, I experimented with scaling the noise, layering scaled down noises for detail, 2D noises (which makes pillars), quantizing the height value to create walkable shelves, and randomly placing glowing vegetations. (3D Perlin noise naturally looks like a cave, so it made sense for me to add light sources to emphasize the geometry and add to the atmosphere.)
![[DADH1.mp4]]
![[3DTerrainGenTest2_Repo - SampleScene - PC, Mac & Linux Standalone - Unity 2019.3.9f1 Personal [PREVIEW PACKAGES IN USE] _DX11_ 2021-11-18 20-32-26_Moment.jpg]]
## 3. Merging biomes into an infinite Pangea
Like Minecraft and other games with large worlds, the world is not loaded all at once, but instead, loaded in chunks. This gave me an opportunity to swap the terrain generation code per chunk to mix and match different types of terrain ("biomes") together. This came at a cost of occasionally broken biome boundaries (I somehow never figured out trilinear interpolation).
![[DADH2.mp4]]
![[DADH3.mp4]]
To take full advantage of the vertical scalability of my terrain generator, I added surface biomes that generates above a certain height threshold and poked glowing holes all around the terrain that connects the surface and the caves together.
![[DADH4.mp4]]
## 4. Making traversal possible with your hands and wings
The most intuitive VR control schemes are the ones where you don't use any buttons at all, evidenced by games like Beat Saber and Gorilla Tag. Drift Abyss relies purely on controller motion for walking forward, flying and gliding. You can also press down on the grip button to start climbing. While climbing your hand movement gets multiplied to compensate for the massive scale of the world.
![[DADH6.mp4]]
## 5. Promoting and hosting exhibitions
I signed Drift Abyss up for the [Project to Support Emerging Media Arts Creators](https://creators.j-mediaarts.bunka.go.jp/) and received funding to continue the development. I used the funds to promote Drift Abyss on social media and host an exhibition in [HIBIYA OKUROJI](https://www.jrtk.jp/hibiya-okuroji/).

#### 5.1 Promoting on social media
I set up an Instagram account to help advertise the exhibition. 
![[photo-output.jpeg|292]]![[1A6DA681-257B-4A94-BA7F-310A88F0FDCC.jpeg|294]]
![[IMG_2956.png|294]]![[IMG_2958.png|293]]
#### 5.2 Setting up
With help from my family and the generous staff at HIBIYA OKUROJI, we set up an exhibition that consisted of the VR experience itself, some of my pixel art pieces and animated projection mapping.
![[IMG_2963.jpeg]]

I created a virtual replica of the room in Unity to plan out the layout for projection mapping.
![[IMG_2971.jpeg|324]]![[IMG_2970.jpeg|313]]
![[IMG_2972.jpeg]]
![[IMG_2997.jpeg]]
#### 5.3 letting the public experience Drift Abyss
I added a streamlined mode for those who are new to VR or interactive media where they are only able to move on a predetermined track. This way, we wouldn't have to worry about the visitors not knowing the controls well and falling infinitely into the caves without exploring much of the world at all (which happened frequently at the beginning of the exhibition).
![[IMG_2979.jpeg]]
## 6. Multithreading and Level of Detail
At this point, the most apparent problem with Drift Abyss was the low framerate and the short render distance. Formerly, Drift Abyss generated terrain and mesh with a compute shader on the GPU. However it came to my attention that since this is a VR project, the GPU doesn't have a lot of processing power to spare after all the rendering. I switched to a C++ based implementation of marching cubes and perlin noise and ran it in multiple CPU threads using [Unity's Job System](https://docs.unity3d.com/6000.4/Documentation/Manual/job-system-overview.html).

I also implemented a rudimentary level of detail system where chunks far away will be rendered in generated in half resolution (1/8 the amount of voxels). However, the size of the chunks itself stayed constant, and therefore the bottleneck was now the high number of chunks each with their own spawn / despawn logic, collision mesh and draw call.

This refactor still yielded a boost in performance and render distance (~30FPS -> ~60FPS, 2 chunk radius -> 4 - 5 chunk radius).
![[DriftAbyss 2023-06-09 20-53-57_Trim.mp4]]
Chunk fade-in shader was implemented at some point made to work with LOD transition as well.
## 7. Infinite, not in theory but in practice
At some point I became skeptical of my hand-crafted biome generation code's ability to create truly unique worlds. About a dozen biomes were implemented at this point, all unique from one another, but the internal variety within each biome were dubious. I thought that, by making each biomes modular and allowing two biomes to mix, it could in theory increase the biome count to hundreds.

e.g. mix of the "sky island" biome and the "canyon" biome
![[DADH7.gif]]

The result was mixed, with some terrain looking beautiful and others looking like total garbage. It also came at the cost of having to generate twice the amount of noise for each chunk.
## 8. Steam release

https://store.steampowered.com/app/2368780/Drift_Abyss/

## 9. Identity crisis and reflection
Development slowed down as it got harder and harder to work around and to maintain the spaghetti code I've made over the last three or four years. I felt like Drift Abyss wasn't quite there to being either a novel artistic experience or an engaging exploration game.

## 10. Starting over for PC and mobile VR support
The year is 2025 and PCVR seemed like it was on its way out. Apparently, most people don't have gaming computers and the ones who do find VR to be too expensive or too much of a hassle to set up considering the small number of content available. I decided I would make it playable on PC and mobile VR platforms like the Meta Quest 3.
![[driftabyssremake1.mp4]]
This time, I tried to plan out the terrain generation algorithm and gameplay beforehand to stop myself from scope creeping. The most important change was that now the player must find a portal to move to the next biome, adding a clear objective to the game while removing the need to spend resources to solve biome boundaries.
![[Screenshot 2025-07-11 130029.png]]
![[Screenshot 2025-07-11 140440.png|369]]
I couldn't fully stop myself from scope creeping, though. I experimented with procedural tree generation and struggled to make consistently good looking trees (regrettably, I didn't look up anything about L-systems or other preexisting plant generation methods).![[Screenshot 2024-09-27 182105.png|315]]![[Screenshot 2024-09-28 011027.png|276]]![[Screenshot 2024-09-28 012607.png|299]]![[Screenshot 2024-09-28 011420.png|286]]
![[Screenshot 2024-09-26 005901.png|305]]
I settled on making a few preset meshes that will be combined in a random combination.
![[Screenshot 2025-08-17 204728.png]]

I also experimented with random biome combinations again, but this time, in a way that avoids unnecessary duplicated work. Each biome generation code is now split into modules so variations of similar features can be swapped with each other seamlessly.
![[Screenshot 2025-08-27 212532.png]]
![[Screenshot 2024-10-16 211219 1.png]]![[Screenshot 2024-10-16 224936.png]]