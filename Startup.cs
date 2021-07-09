using System;
using System.Collections.Generic;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using CloudStorage.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Net.Http.Headers;
using PictureGame.Filters;
using PictureGame.Services;

namespace CloudStorage
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
            services.AddSingleton<GameTableStorage>();
            services.AddSingleton<PlayerTableStorage>();
            services.AddSingleton<ChatTableStorage>();
            services.AddSingleton<IUserNameProvider, UserNameProvider>();
            services.AddSingleton<ICloudStorageAccountProvider, CloudStorageAccountProvider>();
            services.AddSingleton<IConnectionStringProvider, ConnectionStringProvider>();
            services.AddScoped<SignalRHelper>();
            services.AddScoped<AuthorizationFilter>();

            services.AddSignalR(options =>
            {
                options.EnableDetailedErrors = true;
            })
                    .AddAzureSignalR(options =>
                    {
                        options.AccessTokenLifetime = TimeSpan.FromDays(1);
                        options.ClaimsProvider = context => context.User.Claims;
                        options.ConnectionString = "Endpoint=https://picturegame.service.signalr.net;AccessKey=fNOKa6i5nAL7Vjcz+UsP2QoMDJT77Ml7zFVmbpA6Nj0=;Version=1.0;";
                    });
            
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public async void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
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

            var gameTableStorage = app.ApplicationServices.GetRequiredService<GameTableStorage>();
            await gameTableStorage.Startup();

            var playerTableStorage = app.ApplicationServices.GetRequiredService<PlayerTableStorage>();
            await playerTableStorage.Startup();

            var chatTableStorage = app.ApplicationServices.GetRequiredService<ChatTableStorage>();
            await chatTableStorage.Startup();
        }
    }
}
