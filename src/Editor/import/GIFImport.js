import { parseGIF, decompressFrames } from 'gifuct-js';

// Максимальний розмір GIF-файлу за замовчуванням (15 МБ).
// Можна перевизначити через параметр maxFileSize.
const DEFAULT_MAX_GIF_FILE_SIZE = 15 * 1024 * 1024;

class GIFImport {
  /**
   * @param {Object} args
   * @param {File} args.gifFile - вихідний GIF-файл
   * @param {Wick.Project} args.project - проєкт, в який імпортується GIF
   * @param {Function} args.onFinish - викликається з готовим GIFAsset при успіху
   * @param {Function} [args.onError] - викликається з текстом помилки при невдачі
   * @param {number} [args.maxFileSize] - ліміт розміру файлу в байтах
   */
  static importGIFIntoProject (args) {
    let { gifFile, project, onFinish, onError, maxFileSize } = args;

    const sizeLimit = maxFileSize || DEFAULT_MAX_GIF_FILE_SIZE;

    onError = onError || function (message) {
      console.error('GIFImport error:', message);
    };

    // 1. Перевірка розміру файлу — до будь-якого читання чи декодування,
    // щоб не витрачати пам'ять на завідомо завеликий файл.
    if (gifFile.size > sizeLimit) {
      onError(
        'GIF-файл занадто великий (' + (gifFile.size / (1024 * 1024)).toFixed(1) + ' МБ). ' +
        'Максимально допустимий розмір: ' + (sizeLimit / (1024 * 1024)).toFixed(1) + ' МБ.'
      );
      return;
    }

    var reader = new FileReader();

    reader.onerror = () => {
      onError('Не вдалося прочитати GIF-файл.');
    };

    reader.onload = (e) => {
      var buf = e.target.result;

      let gif;
      let frames;
      try {
        gif = parseGIF(buf);
        frames = decompressFrames(gif, true);
      } catch (err) {
        onError('Не вдалося розпізнати GIF-файл: ' + err.message);
        return;
      }

      if (!frames || frames.length === 0) {
        onError('GIF-файл не містить кадрів.');
        return;
      }

      // 2. Перевірка розміру зображення відносно полотна проєкту.
      var gifWidth = gif.lsd.width;
      var gifHeight = gif.lsd.height;
      var canvasWidth = project.width;
      var canvasHeight = project.height;

      if (gifWidth > canvasWidth || gifHeight > canvasHeight) {
        onError(
          'Розмір GIF (' + gifWidth + '×' + gifHeight + ') перевищує розмір полотна проєкту ' +
          '(' + canvasWidth + '×' + canvasHeight + ').'
        );
        return;
      }

      var dataURLs = [];

      // Повне "логічне полотно" GIF (logical screen), на якому композитяться кадри.
      var tempCanvas = document.createElement('canvas');
      var tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = gifWidth;
      tempCanvas.height = gifHeight;

      var frameCanvas = document.createElement('canvas');
      var frameCtx = frameCanvas.getContext('2d');

      frames.forEach(frame => {
        // Кадри GIF можуть бути меншими за повне полотно (часткове оновлення
        // області) — тому кожен кадр малюємо у власний canvas, а потім
        // накладаємо на спільне полотно у відповідній позиції.
        frameCanvas.width = frame.dims.width;
        frameCanvas.height = frame.dims.height;

        var frameImageData = new ImageData(
          new Uint8ClampedArray(frame.patch),
          frame.dims.width,
          frame.dims.height
        );
        frameCtx.putImageData(frameImageData, 0, 0);

        // disposalType === 2 означає "очистити область до фону" перед наступним кадром.
        if (frame.disposalType === 2) {
          tempCtx.clearRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height);
        }

        tempCtx.drawImage(frameCanvas, frame.dims.left, frame.dims.top);

        dataURLs.push(tempCanvas.toDataURL());
      });

      var imageAssets = [];
      try {
        dataURLs.forEach((dataURL, index) => {
          var imageAsset = new window.Wick.ImageAsset({
            filename: gifFile.name + '_' + index + '.png',
            src: dataURL,
          });
          project.addAsset(imageAsset);
          imageAssets.push(imageAsset);
        });
      } catch (err) {
        onError('Не вдалося створити асети кадрів GIF: ' + err.message);
        return;
      }

      project.loadAssets(() => {
        window.Wick.GIFAsset.fromImages(imageAssets, project, gifAsset => {
          gifAsset.name = gifFile.name;
          gifAsset.filename = gifFile.name;
          onFinish(gifAsset);
        });
      });
    };

    reader.readAsArrayBuffer(gifFile);
  }
}

export default GIFImport;
