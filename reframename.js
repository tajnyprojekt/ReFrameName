const { dialog, ipcMain } = require('electron');
const os = require('os');
const fs = require('fs');
const path = require('path');


function initController () {

    ipcMain.on('open-file-dialog', function (event, tag) {
        openDialog(result => {
            // console.log('result', result);
            if (result) {
                result['tag'] = tag;
                event.sender.send('file-dialog-result', result);
            }
        })
    });

    ipcMain.on('rename-files', function (event, options) {
        console.log(event, options)
        renameFiles(options, result => {
            event.sender.send('files-rename-done', result);
        });
    });

}

function openDialog (callback) {
    let properties = ['openDirectory']; // openFile
    if (os.platform() !== 'linux' && os.platform() !== 'win32') {
        properties.push('openDirectory');
    }
    dialog.showOpenDialog({
        properties: properties
    }).then(result => {
        if (callback) {
            callback(result);
        }
    });
}

function renameFiles(options, callback) {
    const files = fs.readdirSync(options.inPath);
    // assuming that sequence filenames are equal despite of the number
    // sort filenames alphabetically to get them in right order
    files.sort(cmpFrameNames);

    let renamedFilesCounter = 0;
    const operationCallback = (err) => {
        if (err) {
            if (callback) callback({ status: err, msg: 'an error occured.' })
            return;
        }
        renamedFilesCounter++;
        if (renamedFilesCounter === files.length) {
            const msg = 'successfully renamed ' + renamedFilesCounter + ' files.';
            console.log(msg);
            if (callback) callback({ status: 'ok', msg: msg });
        }
    }

    for (let i = 0; i < files.length; i++) {

        if (options.mode === 'replace') {
            options.outPath = options.inPath;
        }

        const oldPath = path.join(options.inPath, files[i]);
        const newName = formatFilename(i, options.pattern, path.extname(files[i]));
        const newPath = path.join(options.outPath, newName);
        console.log(options.mode + ' " ' + oldPath + '" to "' + newPath + '"');

        if (options.mode === 'copy') {
            fs.copyFile(oldPath, newPath, fs.constants.COPYFILE_FICLONE, operationCallback);
        }
        else {
            fs.rename(oldPath, newPath, operationCallback);
        }

    }
}

function formatFilename(index, pattern, extension) {
    const formattedNumber = leftFillNum(index, pattern.numberDigits);
    return pattern.baseName + formattedNumber + extension;
}

function leftFillNum(num, targetLength) {
    return num.toString().padStart(targetLength, 0);
}

function cmpFrameNames(a, b) {
    return (Number(a.match(/(\d+)/g)[0]) - Number((b.match(/(\d+)/g)[0])));
}

exports.initController =  initController;
