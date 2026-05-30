December 20th 2025

*tools: [[Unity]], [[Cluster]]*
*project: [[8LEGS GALAXY]]*

Tried my hand at making an atmosphere shader.

Unity 2022 built-in pipeline

I didn’t actually do accurate Rayleigh scattering or Mie scattering or anything, i just made an approximation from the basic concept of sphere / ray intersection and iterating through sample points to check how dense / lit it is

This is what I ended up with:
![[9db24562-5983-4392-9623-e922d78af06a (1).png]]
```
Shader "Unlit/Atmosphere"
{
    Properties
    {
        _AtmosphereHeight ("Atmosphere Height", float) = 0.1
        _AtmosphereDensity ("Atmosphere Density", float) = 1
        _StepCount ("Step Count", float) = 4
        _BlueColor ("Blue Color", Color) = (0, 0, 1, 0)
        _RedColor ("Red Color", Color) = (1, 0, 0, 0)
        _RedlightPower ("Redlight Power", float) = 1
    }
    SubShader
    {
        Tags { "RenderType"="Transparent" "RenderQueue"="Transparent" }
        LOD 100
        Blend One One
        ZWrite Off
        Cull Off

        Pass
        {
            CGPROGRAM
            #include "UnityCG.cginc"
            #include "Lighting.cginc"

            #pragma vertex vert
            #pragma fragment frag

            struct appdata
            {
                float4 vertex : POSITION;
                float3 normal : NORMAL;
            };

            struct v2f
            {
                float4 vertex : SV_POSITION;
                float3 center : TEXCOORD0;
                float3 viewDir  : TEXCOORD1;
                float3 lightDir : TEXCOORD2;
                float3 worldPos : TEXCOORD3;
            };

            float _AtmosphereHeight;
            float _AtmosphereDensity;
            float _StepCount;
            float3 _BlueColor;
            float3 _RedColor;
            float _RedlightPower;

            float invLerp(float from, float to, float value){
                return (value - from) / (to - from);
            }
            float remap(float origFrom, float origTo, float targetFrom, float targetTo, float value){
                float rel = invLerp(origFrom, origTo, value);
                return lerp(targetFrom, targetTo, rel);
            }
            float hash13(float3 p3)
            {
	            p3  = frac(p3 * .1031);
                p3 += dot(p3, p3.zyx + 31.32);
                return frac((p3.x + p3.y) * p3.z);
            }

            bool RaySphere(float3 ro, float3 rd, float3 c, float r, out float t0, out float t1)
            {
                float3 oc = ro - c;
                float b = dot(oc, rd);
                float c2 = dot(oc, oc) - r*r;
                float h = b*b - c2;
                if (h < 0) { t0 = t1 = 0; return false; }
                h = sqrt(h);
                t0 = -b - h;
                t1 = -b + h;
                return true;
            }

            //returns wether theres sun or not
            bool AtmosphereThickness(float3 origin, float3 direction, float3 center, float innerRadius, float outerRadius, out float thick)
            {
                float a0,a1;
                if (!RaySphere(origin, direction, center, outerRadius, a0, a1)){
                    thick = 0;
                    return true;
                }
                float tStart = max(a0, 0.0);
                float tEnd   = max(a1, 0.0);
                thick  = max(0.0, tEnd - tStart);

                float p0, p1;
                if (RaySphere(origin, direction, center, innerRadius, p0, p1))
                {
                    float ps = max(p0, 0.0);
                    float pe = max(p1, 0.0);
                    if (p1 > 0){
                        thick = max(p0, 0.0) - tStart;
                        return false;
                    }
                }

                return true;
            }

            float3 EvaluateAtmosphere(float3 origin, float3 direction, float thickness, float3 lightDirection, float3 center, float innerRadius, float outerRadius){
                float stepSize = thickness / (1 + _StepCount);
                float stepInfluence = _AtmosphereDensity * thickness / _StepCount;

                //not efficient
                float a0, a1;
                if (!RaySphere(origin, direction, center, outerRadius, a0, a1)) return float3(0, 0, 0);
                float tStart = max(a0, 0.0);

                float light = 0;
                float bluelight = 0;
                float redlight = 0;
                float3 samplePos = origin + (direction * (tStart + (stepSize * hash13(tStart + direction))));
                float atmosphereRadius = outerRadius - innerRadius;
                for (int i = 0; i < _StepCount; i++){
                    float localThickness = 0;
                    float localDensity = pow(remap(innerRadius, outerRadius, 1, 0, length(samplePos - center)), 6);
                    if (AtmosphereThickness(samplePos, lightDirection, center, innerRadius, outerRadius, localThickness)) //is there sun?
                    {
                        float transmittence = sqrt(saturate(localThickness / (atmosphereRadius * 6)));
                        light += localDensity * stepInfluence;
                        bluelight += (1 - transmittence) * localDensity * stepInfluence;
                        redlight += transmittence * localDensity * stepInfluence;
                    }
                    samplePos += direction * stepSize;
                }

                float sunPower = pow(saturate(smoothstep(0.3, 1, dot(direction, lightDirection))), 8) * 1;
                return (bluelight * _BlueColor) + (redlight * _RedColor) + (light * _LightColor0.rgb * sunPower);
            }

            v2f vert (appdata v)
            {
                v2f o;
                o.worldPos = mul(unity_ObjectToWorld, v.vertex).xyz;
                o.vertex = UnityObjectToClipPos(v.vertex + float4(v.normal * (_AtmosphereHeight * 0.5), 0));
                o.center = mul(unity_ObjectToWorld, half4(0,0,0,1));
                o.viewDir = normalize(UnityWorldSpaceViewDir(o.worldPos));
                o.lightDir = normalize(UnityWorldSpaceLightDir(o.worldPos));
                return o;
            }

            fixed4 frag (v2f i, bool isFrontFace : SV_IsFrontFace) : SV_Target
            {
                float planetRadius = length(i.worldPos - i.center);

                bool cameraInside = length(_WorldSpaceCameraPos - i.center) < (planetRadius * (1 + _AtmosphereHeight));
                if (!cameraInside && !isFrontFace) discard;
                if (cameraInside && isFrontFace) discard;

                float3 ws = ((i.worldPos - i.center) * (1 + _AtmosphereHeight)) + i.center;
                float3 viewDir = normalize(ws - _WorldSpaceCameraPos);
                float atmosphereRadius = planetRadius * (1 + _AtmosphereHeight);
                float thickness = 0;
                AtmosphereThickness(_WorldSpaceCameraPos, viewDir, i.center, planetRadius, planetRadius * (1 + _AtmosphereHeight), thickness);

                float3 color = EvaluateAtmosphere(_WorldSpaceCameraPos, viewDir, thickness, i.lightDir, i.center, planetRadius, planetRadius * (1 + _AtmosphereHeight));
                return float4(color, 1);
            }
            ENDCG
        }
    }
}
```



Sources:
https://youtu.be/DxfEbulyFcY?si=7n5lP16WnaBjW7L8
https://www.alanzucconi.com/2017/10/10/shader-atmospheric-sphere/