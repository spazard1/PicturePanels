using PicturePanels.Models;
using PicturePanels.Services.Storage;
using QRCoder;
using System.IO;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class GameStateQRCodeGenerator
    {
        public GameStateQRCodeGenerator(ImageTableStorage imageTableStorage)
        {
            ImageTableStorage = imageTableStorage;
        }

        public ImageTableStorage ImageTableStorage { get; }

        public async Task GenerateAsync(GameStateTableEntity gameState)
        {
            QRCodeGenerator qrGenerator = new QRCodeGenerator();
            QRCodeData qrCodeData = qrGenerator.CreateQrCode("https://picturepanels.net/?gc=" + gameState.GameStateId, QRCodeGenerator.ECCLevel.Q);
            PngByteQRCode qrCode = new PngByteQRCode(qrCodeData);
            var pngBytes = qrCode.GetGraphic(20);
            await this.ImageTableStorage.UploadFromStreamAsync(ImageTableStorage.GameStateQRCodesContainer, gameState.GameStateId + ".png", new MemoryStream(pngBytes));
        }
    }
}
