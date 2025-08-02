const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;

class VideoUtils{

    static async getVideometadata(filePath) {
        return new Promise((resolve,reject)=>{
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                     reject(err);
                }
                else{
                    const videoStream = metadata.streams.find((stream)=>stream.codec_type === 'video');
                resolve({
                    duration: metadata.format.duration,
                     size: metadata.format.size,
            resolution: {
              width: videoStream?.width || 0,
              height: videoStream?.height || 0
            },
            bitrate: metadata.format.bit_rate,
            format: metadata.format.format_name
                });
            }


            });
            
        })

}

static async mergeChunks (chunkDir,outputpath,totalChunks){

    const chunks=[];

    for (let i=0; i<totalChunks;i++){
        chunks.push(path.join(chunkDir, `chunk_${i}`));
    }

    for(const chunk of chunks){
        try{
            await fs.access(chunk);

        }
        catch (error) {
            throw new Error(`Chunk Missing: ${chunk}`)
        
    }

}
const  writeStream = require('fs').createWriteStream(outputpath);

for (const chunk of chunks){
    const data = await fs.readFile(chunk);
    writeStream.write(data);
}

writeStream.end();
return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(outputpath));
    writeStream.on('error', (err) => reject(err));
  });

}



  static async cleanupChunks(chunkDir) {
    try {
      const files = await fs.readdir(chunkDir);
      await Promise.all(files.map(file => fs.unlink(path.join(chunkDir, file))));
      await fs.rmdir(chunkDir);
    } catch (error) {
      console.error('Error cleaning up chunks:', error);
    }
  }

  static generateUploadId() {
    return crypto.randomBytes(16).toString('hex');
  }


}
module.exports= VideoUtils;