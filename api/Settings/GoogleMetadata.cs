using Google.Api.Gax;

namespace EventsSample
{   
    public static class GoogleMetadata
    {
        private static async Task<string> GetMetadataAsync(string path)
        {
            const string baseUrl = "http://metadata.google.internal";
            string value = null;

            try 
            {
                string metadataUrl = baseUrl + path;
                
                var http = new HttpClient();
                http.DefaultRequestHeaders.Add("Metadata-Flavor", "Google");
                value = await http.GetStringAsync(metadataUrl);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error reading {path} from metadata server.", e);
            }            

            return value;
        }

        private static async Task SetProjectIdAsync(IConfiguration config)
        {
            const string ProjectIdPath = "/computeMetadata/v1/project/project-id";
            string projectId = await GetMetadataAsync(ProjectIdPath);

            if (projectId != null)
            {
                config["ProjectId"] = projectId;
                Console.WriteLine($"Metadata project-id: {config["ProjectId"]}");
            }
        }

        private static async Task SetComputeInstanceIdAsync(IConfiguration config)
        {
            const string InstanceIdPath = "/computeMetadata/v1/instance/id";
            string instanceId = await GetMetadataAsync(InstanceIdPath);

            if (instanceId != null)
                config["InstanceId"] = instanceId;
        }
        
        public static async Task SetConfigAsync(IConfiguration config)
        {
            var platform = await Platform.InstanceAsync();
            
            if (platform.Type != PlatformType.Unknown)
            {
                config["ProjectId"] = platform.ProjectId;
                await SetComputeInstanceIdAsync(config);
            }
        }
    }
}