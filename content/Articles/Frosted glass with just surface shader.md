May 8th 2026

*tools: [[Unity]], [[HLSL]], [[Cluster]]*

so cool

![[Screen Recording 2026-05-08 220134.mp4]]

It samples the opaque texture / grabpass 9 times to do box blur. Since the samples are more than 1 px apart, I used a hash function to add some noise to the sampling position

```
Shader "Custom/FrostyGlass"
{
    Properties
    {
        _Color ("Color", Color) = (1,1,1,1)
        _MainTex ("Albedo (RGB)", 2D) = "white" {}
        _NoiseStrength ("Noise Strength", float) = 0.01
        _FrostStrength ("Frost Strength", float) = 0.01
    }
    SubShader
    {
        Tags { "RenderType"="Transparent" "Queue"="Transparent+10" }
        GrabPass { "_GrabTexture" }
        ZWrite Off
        Cull Back
        LOD 200
        CGPROGRAM
        #pragma surface surf Standard noshadow alpha:fade vertex:vert
        #pragma target 3.0

        struct Input
        {
            float2 uv_MainTex;
            float4 grabPos;
        };

        void vert(inout appdata_full v, out Input o)
        {
            UNITY_INITIALIZE_OUTPUT(Input, o);

            float4 clipPos = UnityObjectToClipPos(v.vertex);
            o.grabPos = ComputeGrabScreenPos(clipPos);
        }
        
        sampler2D _MainTex;
        sampler2D _GrabTexture;
        float4 _GrabTexture_TexelSize;

        fixed4 _Color;
        float _NoiseStrength;
        float _FrostStrength;

        // Add instancing support for this shader. You need to check 'Enable Instancing' on materials that use the shader.
        // See https://docs.unity3d.com/Manual/GPUInstancing.html for more information about instancing.
        // #pragma instancing_options assumeuniformscaling
        UNITY_INSTANCING_BUFFER_START(Props)
            // put more per-instance properties here
        UNITY_INSTANCING_BUFFER_END(Props)

        float2 hash23(float3 p)
        {
	        float3 p3 = frac(p * float3(.1031, .1030, .0973));
            p3 += dot(p3, p3.yzx+135.245);
            return frac((p3.xx+p3.yz)*p3.zy);
        }

        void surf (Input IN, inout SurfaceOutputStandard o)
        {
            fixed4 c = tex2D (_MainTex, IN.uv_MainTex) * _Color;
            o.Albedo = fixed3(0, 0, 0);
            o.Smoothness = c.a;
            o.Metallic = 0;
            o.Alpha = 1;

            float2 grabUV = IN.grabPos.xy / IN.grabPos.w;
            float2 noise = (hash23(IN.grabPos.xyz) - float2(0.5, 0.5)) * c.a * _NoiseStrength;
            grabUV += noise;

            float offset = _FrostStrength * c.a;

            fixed4 col = fixed4(0, 0, 0, 0);
            col += tex2D(_GrabTexture, grabUV + float2(-offset, -offset));
            col += tex2D(_GrabTexture, grabUV + float2(-offset, 0));
            col += tex2D(_GrabTexture, grabUV + float2(-offset, offset));
            col += tex2D(_GrabTexture, grabUV + float2(0, -offset));
            col += tex2D(_GrabTexture, grabUV + float2(0, 0));
            col += tex2D(_GrabTexture, grabUV + float2(0, offset));
            col += tex2D(_GrabTexture, grabUV + float2(offset, -offset));
            col += tex2D(_GrabTexture, grabUV + float2(offset, 0));
            col += tex2D(_GrabTexture, grabUV + float2(offset, offset));
            col /= 9;

            o.Emission = col.rgb * c.rgb;
        }
        ENDCG
    }
    FallBack "Diffuse"
}


```