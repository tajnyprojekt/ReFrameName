const { ipcRenderer } = require('electron');
const $ = require('jquery');

$(document).ready(function() {
    console.log('ReFrameName v1.0.0');

    const $inDirInput = $('#in-dir-input');
    const $inDirButton = $('#in-dir-button');
    const $outDirInput = $('#out-dir-input');
    const $outDirButton = $('#out-dir-button');
    const $modeRadio = $('.mode-radio');
    const $baseNameInput = $('#base-name-input');
    const $numberDigitsInput = $('#number-digits-input');
    const $goButton = $('#go-button');
    const $msg = $('#msg');
    const $patternPreview = $('#pattern-preview');

    let params = {
        inPath: '',
        outPath: '',
        mode: 'replace',
        pattern: {
            baseName: 'frame-',
            numberDigits: 4
        }
    };

    // $(document).on('dragstart', event => {
    //     event.preventDefault();
    //     console.log(event);
    //     // ipcRenderer.send('ondragstart', '/path/to/item');
    // });

    $inDirButton.on('click', () => {
        ipcRenderer.send('open-file-dialog', 'in');
    });

    $outDirButton.on('click', () => {
        ipcRenderer.send('open-file-dialog', 'out');
    });

    ipcRenderer.on('file-dialog-result', (event, result) => {
        if (!result.canceled) {
            console.log('Selected path: ', result.filePaths);
            const selectedPath = result.filePaths[0];
            if (result.tag === 'in') {
                params.inPath = selectedPath;
                $inDirInput.val(selectedPath)
            }
            if (result.tag === 'out') {
                params.outPath = selectedPath;
                $outDirInput.val(selectedPath)
            }
        }
    });

    $inDirInput.on('input change', () => {
        params.inPath = $inDirInput.val();
    });

    $outDirInput.on('input change', () => {
        params.inPath = $outDirInput.val();
    });

    $modeRadio.on('change', () => {
        params.mode = $('input[name="mode-radio"]:checked').val();
        if (params.mode === 'replace') {
            $outDirInput.parent().addClass('disabled');
            $outDirInput.attr('disabled', true);
            $outDirButton.attr('disabled', true);
        }
        else {
            $outDirInput.parent().removeClass('disabled');
            $outDirInput.attr('disabled', false);
            $outDirButton.attr('disabled', false);

        }
    });

    $baseNameInput.on('input change', () => {
        params.pattern.baseName = $baseNameInput.val();
        updatePatternPreview();
    });

    $numberDigitsInput.on('input change', () => {
        let numberDigits = $numberDigitsInput.val();
        if (numberDigits === undefined || numberDigits === '' || numberDigits < 0) {
            numberDigits = 1;
        }
        params.pattern.numberDigits = Math.floor(numberDigits);
        updatePatternPreview();
    });

    $goButton.on('click', () => {
        ipcRenderer.send('rename-files', params);
        $goButton.addClass('processing')
    });

    ipcRenderer.on('files-rename-done', (event, result) => {
        console.log('Rename result:', result);
        $goButton.removeClass('processing')
        $msg.text(result.msg);
    });

    // read and validate inputs values and
    function updatePatternPreview() {
        let pattern = params.pattern.baseName;
        for (let i = 0; i < params.pattern.numberDigits; i++) {
            pattern += '0';
        }
        $patternPreview.text(pattern);
    }

    $('.close').on('click', function () {
        $(this).parent().fadeOut();
    });

});

