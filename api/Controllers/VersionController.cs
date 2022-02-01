using System.Diagnostics;
using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventsSample
{
    public record VerisonInfo
    (
        string ProjectId,
        string Version,
        string ComputeInstanceId
    );

    [Route("[controller]")]
    public class VersionController : Controller
    {
        readonly VerisonInfo _version;

        public VersionController(IConfiguration config)
        {
            _version = new VerisonInfo
            (
                ProjectId: config["ProjectId"],
                ComputeInstanceId: GetShortInstanceId(config["InstanceId"]),
                Version: GetVersion()
            );
        }

        [AllowAnonymous]
        [HttpGet()]
        public VerisonInfo Version()
        {
            return _version;
        }

        private string GetVersion()
        {
            try 
            {
                var assembly = Assembly.GetExecutingAssembly();
                return assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()
                    .InformationalVersion;
            }
            catch 
            {
                return "";
            }
        }
        
        private string GetShortInstanceId(string instanceId)
        {
            return String.Format("{0:X}", instanceId.GetHashCode());
        }        
    }
}