namespace PicturePanels.Entities
{
    public class MoveImageEntity
    {
        public MoveImageEntity()
        {

        }

        public string SourceBlobContainer { get; set; }

        public string SourceImageId { get; set; }

        public string TargetBlobContainer { get; set; }
    }
}
