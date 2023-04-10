$(document).ready(function () {

console.log("Document Ready");

    const svgBlock = $('#sw-svg-container');
    const strokeToggle = $('.stroke');
    let copy = $('#copy');
    let angleSlider = $('.range-slider-angle');
    let removeGradients = $('.remove-gradient');
    let curveSlider = $('.range-slider-curve');
    let randomMix = $("#sw-blob-random-mix");
    let download = $("#sw-download-link");
    let color = 'rgba(248, 117, 55, 1)';
    let color2 = 'rgba(251, 168, 31, 1)';
    let angle = angleSlider.val();
    let curve = curveSlider.val();
    let shape;
    let stroke = false;
    const cssAnimate = {transition: 'all 0.3s'};
    const pickerSettings = {

        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
            hex: true,
            rgba: true,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: true,
            clear: true,
            save: false
        }
    };
    const pickr1 = Pickr.create({
        el: '.color-picker-1',
        theme: 'monolith', // or 'monolith', or 'nano'
        default: 'rgba(248, 117, 55, 1)',
        components: {

            // Main components
            preview: true,
            opacity: true,
            hue: true,

            // Input / output Options
            interaction: {
                hex: true,
                rgba: true,
                hsla: false,
                hsva: false,
                cmyk: false,
                input: true,
                clear: false,
                save: false
            }
        }
    });
    // const pickr2 = Pickr.create({
    //     el: '.color-picker-2',
    //     theme: 'monolith', // or 'monolith', or 'nano'
    //     default: 'rgba(251, 168, 31, 1)',
    //     components: pickerSettings
    // });
    createSvg(angle, curve);
    updatePNGDownloadURL(d3.select("#sw-js-blob-svg").node(), document.getElementById('sw-download-png'));

    angleSlider.on('input', angleRangeSlider);
    curveSlider.on('input', curveRangeSlider);
    pickr1.on('change', c => {
        color = c.toRGBA().toString(3);
        $('#stop1').attr('stop-color', color);
        updateSVG(shape);
        pickr1.applyColor();
    })
    pickr2.on('change', c => {
        color2 = c.toRGBA().toString(3);
        $('#stop2').attr('stop-color', color2);
        updateSVG(shape);
        pickr2.applyColor();
    })
    pickr2.on('clear', c => {
        color2 = null;
        updateSVG(shape);
    })
    randomMix.on('click', () => {
        shape = generatePath(angle, curve)
        updateSVG(shape)
    });
    removeGradients.on('click', () => {
        $('#pr2').css({background: color});
        $('#stop2').attr('stop-color', color);
        updateSVG(shape)
    });
    download.on('click', () => {
        downloadSVGLinkGenerator('blob.svg')
    });
    copy.on('click', () => {
        copyToClipboard('#sw-svg-container');
    });

    strokeToggle.on('click', function () {
        $(this).toggleClass('fill');
        stroke = !stroke;
        updateSVG(shape);
    });


    function roundPath(path, precision = 0.1) {
        if (!path) return
        const query = /[\d.-][\d.e-]*/g
        return path.replace(query, n => Math.round(n * (1 / precision)) / (1 / precision))
    }

    function generateBlobShape(data) {
        const shapeGenerator = d3.radialLine()
            .angle((d, i) => (i / data.length) * 2 * Math.PI)
            .curve(d3.curveBasisClosed)
            .radius(d => d)
        return shapeGenerator(data.map(d => Math.abs(d)))
    }

    function generateData(complexity, contrast) {
        const scale = d3.scaleLinear()
            .domain([0, 1])
            .range([50 - (50 / 12 * contrast - 0.01), 50])
        return d3.range(complexity).map(() => scale(Math.random()))
    }

    function getSVGContent(pathString) {
        return `<?xml version="1.0" standalone="no"?>
              <svg id="sw-js-blob-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs> 
                        <linearGradient id="sw-gradient" x1="0" x2="1" y1="1" y2="0">
                            <stop id="stop1" stop-color="${color}" offset="0%"></stop>
                            <stop id="stop2" stop-color="${color2}" offset="100%"></stop>
                        </linearGradient>
                    </defs>
                <path fill="${color}" d="${pathString}"  width="100%" height="100%" transform="translate(50 50)"/>
              </svg>`
    };

    function generatePath(angle, curve) {
        const initialData = generateData(angle, curve);
        return roundPath(generateBlobShape(initialData) + "Z");
    }

    function createSvg(angle, curve) {
        svgBlock.empty();
        shape = generatePath(angle, curve);
        const svg = getSVGContent(shape);
        svgBlock.append(svg);
        if (color2) {
            updateSVG(shape);
        }
    }

    function updateSVG(shape) {
        const el = $('#sw-js-blob-svg path');

        let background = color;
        if (color2) {
            background = `url(#sw-gradient)`;
        }

        if (stroke) {
            el.attr('fill', 'none').css(cssAnimate);
            el.attr('stroke-width', '1').css(cssAnimate);
            el.attr('stroke', background).css(cssAnimate);
        } else {
            el.attr('fill', background).css(cssAnimate);
            el.attr('stroke-width', '0').css(cssAnimate);
        }
        el.attr('d', shape).css(cssAnimate);
        updatePNGDownloadURL(d3.select("#sw-js-blob-svg").node(), document.getElementById('sw-download-png'));
    }

    function angleRangeSlider() {
        angle = $(this).val();
        shape = generatePath(angle, curve)
        updateSVG(shape)
        console.log("Angle Range");
    }

    function curveRangeSlider() {
        curve = $(this).val();
        shape = generatePath(angle, curve)
        updateSVG(shape)
    }

    function downloadSVGLinkGenerator(fileName) {
        const html = d3.select("#sw-js-blob-svg")
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .node().parentNode.innerHTML;
        var blob = new Blob([html], {type: "image/svg+xml"});
        createLink(blob, fileName)

    }

    function createLink(blob, fileName) {
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    function copyToClipboard(element) {
        $('.copy').hide();
        $('.copy-active').show();
        const $temp = $("<input>");
        $('body').append($temp);
        $temp.val($(element).html()).select();
        document.execCommand("copy");
        $temp.remove();
        setTimeout(function(){
            $('.copy').show();
            $('.copy-active').hide();
        },1000)
    }

    function getPNGDownloadURL(svg, callback) {
        var canvas;
        var source = svg.parentNode.innerHTML;
        var image = d3.select('body').append('img')
            .style('display', 'none')
            .attr('width', 500)
            .attr('height', 500)
            .node();

        image.onerror = function () {
            callback(new Error('An error occurred while attempting to load SVG'));
        };
        image.onload = function () {
            canvas = d3.select('body').append('canvas')
                .style('display', 'none')
                .attr('width', 500)
                .attr('height', 500)
                .node();

            var ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            var url = canvas.toDataURL('image/png');

            d3.selectAll([canvas, image]).remove();

            callback(null, url);
        };
        image.src = 'data:image/svg+xml,' + encodeURIComponent(source);
    }

    function updatePNGDownloadURL(svg, link) {
        getPNGDownloadURL(svg, function (error, url) {
            if (error) {
                console.error(error);
            } else {
                link.href = url;
            }
        });
    }

});
