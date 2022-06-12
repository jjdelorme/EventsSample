using Google.Api.Gax;
using Swashbuckle.AspNetCore.Swagger;
using Microsoft.OpenApi.Interfaces;
using Microsoft.OpenApi.Any;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace EventsSample
{   
    public static class GoogleMetadata
    {
        public static async Task SetConfigAsync(IConfiguration config)
        {
            var platform = await Platform.InstanceAsync();
        
            if (platform?.Type == PlatformType.CloudRun)
            {
                var gceDetails = GcePlatformDetails.TryLoad(platform.CloudRunDetails.MetadataJson);

                config["ProjectId"] = platform.ProjectId;
                config["InstanceId"] = GetShortInstanceId(gceDetails?.InstanceId);
                config["ServiceRevision"] = 
                    $"{platform.CloudRunDetails.ServiceName}-{platform.CloudRunDetails.RevisionName}";
            }
        }

        public static void ConfigureSwagger(SwaggerOptions options)
        {
            options.SerializeAsV2 = true;
            options.PreSerializeFilters.Add((doc, http) => 
            {
                doc.Extensions = new Dictionary<string, IOpenApiExtension>
                {
                    {
                        "x-google-backend", new OpenApiObject
                        {
                            {"address", new OpenApiString($"https://{http.Host.Value}")},
                            {"protocol", new OpenApiString("h2")}
                        }
                    }
                }; 
            });
        }

        public static string GetOperationId(ApiDescription api)
        {
            return api.TryGetMethodInfo(out System.Reflection.MethodInfo info) ? 
                $"{api.ActionDescriptor.RouteValues["controller"]}_{info.Name}" : 
                $"{api.ActionDescriptor.RouteValues["controller"]}_{api.HttpMethod}";
        }

        private static string GetShortInstanceId(string instanceId)
        {
            if (string.IsNullOrWhiteSpace(instanceId))
                return "";
                
            return String.Format("{0:X}", instanceId.GetHashCode());
        }        
    }
}