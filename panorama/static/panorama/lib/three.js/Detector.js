/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */

var Detector = {

    canvas: !!window.CanvasRenderingContext2D,
    webgl: (function () {
        try {
            var canvas = document.createElement('canvas');
            return !!( window.WebGLRenderingContext && ( canvas.getContext('webgl') || canvas.getContext('experimental-webgl') ) );
        } catch (e) {
            return false;
        }
    })(),
    workers: !!window.Worker,
    fileapi: window.File && window.FileReader && window.FileList && window.Blob,

    getWebGLErrorMessage: function () {

        var element = document.createElement('div');
        element.id = 'webgl-error-message';
        element.style.fontFamily = 'monospace';
        element.style.fontSize = '13px';
        element.style.fontWeight = 'normal';
        element.style.textAlign = 'center';
        element.style.background = '#ffd598';
        element.style.color = '#000';
        element.style.padding = '1em 0';
        element.style.position = 'absolute';
        element.style.top = '0';
        element.style.left = '0';
        element.style.width = '100%';
        element.style.zIndex = '10';

        if (!this.webgl) {
            element.innerHTML = window.WebGLRenderingContext ?
                '您的显卡似乎不支持 <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>。<br />点击 <a href="http://get.webgl.org/" style="color:#000">这里</a> 查看如何获取WebGL支持'
                :
                '您的浏览器似乎不支持 <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>。<br />点击 <a href="http://get.webgl.org/" style="color:#000">这里</a> 查看如何获取WebGL支持';
        }
        return element;

    },

    addGetWebGLMessage: function (parameters) {
        var parent, id, element;
        parameters = parameters || {};
        parent = parameters.parent !== undefined ? parameters.parent : document.body;
        id = parameters.id !== undefined ? parameters.id : 'oldie';
        element = Detector.getWebGLErrorMessage();
        element.id = id;
        parent.appendChild(element);
    }
};