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

        private static async Task<string> GetComputeInstanceIdAsync()
        {
            const string InstanceIdPath = "/computeMetadata/v1/instance/id";
            string instanceId = await GetMetadataAsync(InstanceIdPath);

            return instanceId;
        }
        
        public static async Task SetConfigAsync(IConfiguration config)
        {
            var platform = await Platform.InstanceAsync();
            
            if (platform.Type != PlatformType.Unknown)
            {
                config["ProjectId"] = platform.ProjectId;
                config["InstanceId"] = await GetComputeInstanceIdAsync();
            }
        }
    }
}