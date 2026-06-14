June 2026

*tools: [[Godot]]*

https://noyco333.github.io/WebParkourBuild/

![[Pasted image 20260606134356.png]]

- Mirror's edge inspired
- Target platform: browser
- Running acceleration
- Vaulting and climbing
- Three input format (Controller, Keyboard and mouse, Keyboard and no mouse (for all the school Chromebook people out there lmao))
- Immersive audio design
- Minimal / immersive UI

Godot is much more lightweight than Unity, but it still excels at certain features over Unity:
- CSGs (like ProBuilder but with non-destructive boolean operators)
- Audio clips directly in animation clips
- AudioStreamRandomizer solution for sound effects that have multiple variations and random pitch / volume variation. Not as robust as FMOD but still nice to have.
- Standard Material has triplanar mapping support. Great for prototyping
- Built-in SDFGI (signed distance field global illumination, like the one in Minecraft Path-tracing shaders)
	- only available on the Forward+ render pipeline (incompatible with browser builds)
- Blender integration

Godot has nodes that does constant raycasting / shapecasting at their position. This made it easier for me to make this project because unlike Unity I didn't have to keep track of the raycast settings (like setting max distance and collision layers) every frame from code.

Godot also has GDScript which is kind of looks like Python and has untyped variables. This is great because it makes all variables nullable, and you can still define a variable type if desired (though I keep getting integer math'd every time I forget to add a .0 at the end of whole number float values).

![[Screen Recording 2026-06-14 123645.mp4]]