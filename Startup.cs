using System;
using System.Collections.Generic;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using PicturePanels.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Net.Http.Headers;
using PicturePanels.Filters;
using Microsoft.AspNetCore.Http;
using PicturePanels.Services.Storage;

namespace PicturePanels
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var encoderSettings = new TextEncoderSettings();
            encoderSettings.AllowRange(UnicodeRanges.All);
            encoderSettings.AllowCharacters(':');

            services.AddControllersWithViews(options =>
            {
                options.Filters.Add(typeof(AuthorizationFilter));
            }).AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
            });

            services.AddSingleton<ImageTableStorage>();
            services.AddSingleton<GameStateTableStorage>();
            services.AddSingleton<PlayerTableStorage>();
            services.AddSingleton<ChatTableStorage>();
            services.AddSingleton<TeamGuessTableStorage>();
            services.AddSingleton<IUserNameProvider, UserNameProvider>();
            services.AddSingleton<ICloudStorageAccountProvider, CloudStorageAccountProvider>();
            services.AddSingleton<IConnectionStringProvider, ConnectionStringProvider>();
            services.AddSingleton<GameStateQueueService>();
            services.AddSingleton<SignalRHelper>();
            services.AddSingleton<GameStateService>();
            services.AddSingleton<ChatService>();

            services.AddScoped<AuthorizationFilter>();

            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            services.AddSignalR(options =>
            {
                options.EnableDetailedErrors = true;
            })
            .AddAzureSignalR(options =>
            {
                options.AccessTokenLifetime = TimeSpan.FromDays(1);
                options.ClaimsProvider = context => context.User.Claims;
                options.ConnectionString = "***REMOVED***";
            });
 
            services.AddWebOptimizer(pipeline =>
            {
                pipeline.MinifyCssFiles();
                pipeline.MinifyJsFiles();
            });

            services.AddHostedService<GameStateBackgroundService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public async void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseWebOptimizer();
            }

            app.UseStaticFiles();

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<SignalRHub>("/signalRHub");
            });

            var gameTableStorage = app.ApplicationServices.GetRequiredService<GameStateTableStorage>();
            await gameTableStorage.StartupAsync();

            var playerTableStorage = app.ApplicationServices.GetRequiredService<PlayerTableStorage>();
            await playerTableStorage.StartupAsync();

            var chatTableStorage = app.ApplicationServices.GetRequiredService<ChatTableStorage>();
            await chatTableStorage.StartupAsync();

            var teamGuessTableStorage = app.ApplicationServices.GetRequiredService<TeamGuessTableStorage>();
            await teamGuessTableStorage.StartupAsync();
        }
    }
}
