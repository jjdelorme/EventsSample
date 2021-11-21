using Google.Api.Gax;

namespace EventsSample
{   
    public static class GoogleMetadata
    {   public static async Task SetConfigAsync(IConfiguration config)
        {
            var platform = await Platform.InstanceAsync();
            
            if (platform.Type != PlatformType.Unknown)
            {
                config["ProjectId"] = platform.ProjectId;
                config["InstanceId"] = platform.GceDetails?.InstanceId;
            }
        }
    }
}