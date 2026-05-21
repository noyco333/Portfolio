2026 April 30 (updated May 11th)

*tools: [[Unity]], [[HLSL]], [[Cluster]]*
*project: [[Marina '88]]*

I made a shader that adds thick, stylized rim lighting effect that works for both smooth and sharp 3D objects using the depth buffer.

Most rim light solutions online uses the fresnel effect, which works fine for round edges but the width is unstable and unusable for objects with sharp edges:
![[Pasted image 20260430230633.png]]

Instead I was looking more of a flat, blocky rim light that's really bold and cool in my opinion.
![[Pasted image 20260430231105.png]]
*source: Scott Pilgrim Takes Off (2023)*

I'm like 90% sure PEAK is one of the very few example where this technique is used in a video game...
![[Pasted image 20260430233050.png]]
*source: NGOHQ.com*

For each pixel the shader samples the depth buffer at that position and also at a position slightly offset in the direction which the main light is coming from. If there is a big enough drop (for example, the current pixel is Scott whos 2 meters from the camera and the offset pixel is the back wall thats 20 meters from the camera) then that pixel will be painted over with the color of the main light.

Looks like this in action:
![[20260430-1419-58.5722771.mp4]]

new (less issues with distance and low viewing angle):
```
Shader "CustomPostProcessing/Rimlight"
{
    Properties
    {
        [HDR] _Color ("Color", Color) = (1,1,1,1)
        _Threshold ("Threshold", float) = 10
    }
    SubShader
    {
        Tags { "RenderType"="Transparent" "Queue"="Transparent+100" "LightMode"="ForwardBase" }
        LOD 100
        Blend One One

        ZTest Always
        ZWrite Off
        Cull Off

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma multi_compile_fwdbase

            #include "UnityCG.cginc"
            #include "Lighting.cginc"
            #include "AutoLight.cginc"

            struct appdata
            {
                float3 normal : NORMAL;
                float4 vertex : POSITION;
            };

            struct v2f
            {
                float4 vertex : SV_POSITION;
                float4 screenPos : TEXCOORD0;
                float3 viewRay   : TEXCOORD1;
            };

            float _Threshold;
            fixed4 _Color;
            sampler2D _CameraDepthTexture;
            UNITY_DECLARE_SHADOWMAP(_ShadowMapTexture);

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(mul(unity_WorldToObject, float4(_WorldSpaceCameraPos + v.vertex, 1.0)));
                o.screenPos = ComputeScreenPos(o.vertex);
                float3 viewPos = UnityObjectToViewPos(v.vertex);
                o.viewRay = viewPos * (-1.0 / viewPos.z);
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                float2 screenUV = i.screenPos.xy / i.screenPos.w;
                float depth = SAMPLE_DEPTH_TEXTURE(_CameraDepthTexture, screenUV);
                float linearDepth = LinearEyeDepth(depth);

                float3 lightDirWS = normalize(_WorldSpaceLightPos0.xyz);
                float3 lightDirVS = mul((float3x3)UNITY_MATRIX_V, lightDirWS);
                float2 offset = normalize(float2(lightDirVS.x, max(0.25, -lightDirVS.y))) * 0.005 * saturate((-lightDirVS.z + 1) / 2) * min(1, 6 / linearDepth);

                float depth2 = SAMPLE_DEPTH_TEXTURE(_CameraDepthTexture, screenUV + offset);
                float linearDepth2 = LinearEyeDepth(depth2);
                
                float3 viewPos = i.viewRay * linearDepth;
                viewPos.z *= -1.0;
                float3 worldPos = mul(unity_CameraToWorld, float4(viewPos, 1.0)).xyz;

                //offset worldpos to allow light to shine thru a bit
                worldPos += lightDirWS * 0.25;

                float4 shadowCoord = mul(unity_WorldToShadow[0], float4(worldPos.xyz, 1.0));
                half shadow = UNITY_SAMPLE_SHADOW(_ShadowMapTexture, shadowCoord);

                //return fixed4(worldPos, 1);
                return fixed4(_LightColor0.xyz * _Color.xyz * min(step(linearDepth, _Threshold * 15), 1 - step(linearDepth2 - linearDepth, _Threshold)) * shadow, 1);
            }
            ENDCG
        }
    }
}

```


old:
```
Shader "CustomPostProcessing/Rimlight"
{
    Properties
    {
        [HDR] _Color ("Color", Color) = (1,1,1,1)
        _Threshold ("Threshold", float) = 10
    }
    SubShader
    {
        Tags { "RenderType"="Transparent" "Queue"="Transparent+100" }
        LOD 100
        Blend One One

        ZTest Always
        ZWrite Off
        Cull Off

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag

            #include "UnityCG.cginc"
            #include "Lighting.cginc"

            struct appdata
            {
                float3 normal : NORMAL;
                float4 vertex : POSITION;
            };

            struct v2f
            {
                float4 vertex : SV_POSITION;
                float4 screenPos : TEXCOORD0;
            };

            float _Threshold;
            fixed4 _Color;
            sampler2D _CameraDepthTexture;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(mul(unity_WorldToObject, float4(_WorldSpaceCameraPos + v.vertex, 1.0)));
                o.screenPos = ComputeScreenPos(o.vertex);
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                float2 screenUV = i.screenPos.xy / i.screenPos.w;

                float3 lightDirWS = normalize(_WorldSpaceLightPos0.xyz);
                float3 lightDirVS = mul((float3x3)UNITY_MATRIX_V, lightDirWS);
                float2 offset = normalize(float2(lightDirVS.x, max(0.25, -lightDirVS.y))) * 0.005 * saturate((-lightDirVS.z + 1) / 2);

                float depth = SAMPLE_DEPTH_TEXTURE(_CameraDepthTexture, screenUV);
                float linearDepth = LinearEyeDepth(depth);
                float depth2 = SAMPLE_DEPTH_TEXTURE(_CameraDepthTexture, screenUV + offset);
                float linearDepth2 = LinearEyeDepth(depth2);

                //return float4(screenUV.x, screenUV.y, 0, 0);
                //return linearDepth2 * 0.1;
                //return min(0.25, (linearDepth2 - linearDepth));
                return fixed4(_LightColor0.xyz * _Color.xyz * min(step(linearDepth, _Threshold * 7), 1 - step(linearDepth2 - linearDepth, _Threshold)), 1);
            }
            ENDCG
        }
    }
}

```