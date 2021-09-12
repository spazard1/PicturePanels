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
using PicturePanels.Services.Authentication;

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
            services.AddSingleton<GameRoundTableStorage>();
            services.AddSingleton<ImageTagTableStorage>();
            services.AddSingleton<ImageNumberTableStorage>();
            services.AddSingleton<UserTableStorage>();
            services.AddSingleton<UserPlayedImageTableStorage>();
            services.AddSingleton<ActiveGameBoardTableStorage>();

            services.AddSingleton<IUserNameProvider, UserNameProvider>();
            services.AddSingleton<ICloudStorageAccountProvider, CloudStorageAccountProvider>();
            services.AddSingleton<IConnectionStringProvider, ConnectionStringProvider>();
            services.AddSingleton<GameStateQueueService>();
            services.AddSingleton<SignalRHelper>();
            services.AddSingleton<GameStateService>();
            services.AddSingleton<ChatService>();
            services.AddSingleton<CertificateProvider>();
            services.AddSingleton<SecurityProvider>();

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
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
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

            var gameStateTableStorageTask = app.ApplicationServices.GetRequiredService<GameStateTableStorage>().StartupAsync();
            var playerTableStorageTask = app.ApplicationServices.GetRequiredService<PlayerTableStorage>().StartupAsync();
            var chatTableStorageTask = app.ApplicationServices.GetRequiredService<ChatTableStorage>().StartupAsync();
            var teamGuessTableStorageTask = app.ApplicationServices.GetRequiredService<TeamGuessTableStorage>().StartupAsync();
            var imageTableStorageTask = app.ApplicationServices.GetRequiredService<ImageTableStorage>().StartupAsync();
            var gameRoundTableStorageTask = app.ApplicationServices.GetRequiredService<GameRoundTableStorage>().StartupAsync();
            var imageTagTableStorageTask = app.ApplicationServices.GetRequiredService<ImageTagTableStorage>().StartupAsync();
            var imageNumberTableStorageTask = app.ApplicationServices.GetRequiredService<ImageNumberTableStorage>().StartupAsync();
            var userTableStorageTask = app.ApplicationServices.GetRequiredService<UserTableStorage>().StartupAsync();
            var userPlayedImageTableStorageTask = app.ApplicationServices.GetRequiredService<UserPlayedImageTableStorage>().StartupAsync();
            var activeGameBoardTableStorageTask = app.ApplicationServices.GetRequiredService<ActiveGameBoardTableStorage>().StartupAsync();
        }
    }
}
