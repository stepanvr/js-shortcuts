/**
 * JavaScript Shortcuts Library (jQuery plugin) v0.4
 * http://www.stepanreznikov.com/js-shortcuts/
 * Copyright (c) 2010 Stepan Reznikov (stepan.reznikov@gmail.com)
 * Date: 2010-03-18
 */

/*global jQuery */

(function($) {

    /** Специальные клавиши */
    var special = {'backspace': 8, 'tab': 9, 'enter': 13, 'pause': 19, 'capslock': 20, 'esc': 27, 'space': 32, 'pageup': 33, 'pagedown': 34, 'end': 35, 'home': 36, 'left': 37, 'up': 38, 'right': 39, 'down': 40, 'insert': 45, 'delete': 46, 'f1': 112, 'f2': 113, 'f3': 114, 'f4': 115, 'f5': 116, 'f6': 117, 'f7': 118, 'f8': 119, 'f9': 120, 'f10': 121, 'f11': 122, 'f12': 123, '?': 191};

    /** Хеш со списками шорткатов */
    var lists = {};

    /** В этом хеше запоминаем какие клавиши нажаты в данный момент. Ключ - ASCII-код клавиши (e.which), значение - true/false. */
    var pressed = {};

    var isStarted = false;

    var active;

    var getKey = function(type, maskObj) {
        var key = '';

        key += type;

        if (maskObj.ctrl) { key += '_ctrl'; }
        if (maskObj.alt) { key += '_alt'; }
        if (maskObj.shift) { key += '_shift'; }

        if (maskObj.which && maskObj.which !== 16 && maskObj.which !== 17 && maskObj.which !== 18){
            key += '_' + maskObj.which;
        }

        return key;
    };

    var getMaskObject = function(mask) {
        var obj = {};
        var items = mask.split('+');

        $.each(items, function(i, item) {
            if (item === 'ctrl' || item === 'alt' || item === 'shift') {
                obj[item] = true;
            } else {
                obj.which = special[item] || item.toUpperCase().charCodeAt();
            }
        });

        return obj;
    };

    var checkIsInput = function(target) {
        var name = target.tagName.toLowerCase();
        var type = target.type;

        if ((name === 'input' && (type === 'text' || type === 'password' || type === 'file' || type === 'search')) || name === 'textarea') {
            return true;
        } else {
            return false;
        }
    };

    var run = function(type, e) {
        if (!active) { return; }

        var maskObj = {
            ctrl: e.ctrlKey,
            alt: e.altKey,
            shift: e.shiftKey,
            which: e.which
        };

        var isInput = checkIsInput(e.target);
        var key = getKey(type, maskObj); // Получаем по типу события и маске ключ
        var shortcuts = active[key]; // Получаем по ключу шорткаты

        if (!shortcuts) { return; }

        var isPrevented = false;

        $.each(shortcuts, function(i, shortcut) {
            // Если не в инпуте или для данного шортката разрешено выполнение в инпутах
            if (!isInput || shortcut.enableInInput) {
                if (!isPrevented) {
                    e.preventDefault();
                    isPrevented = true;
                }
                shortcut.handler(e); // Выполняем шорткат
            }
        });
    };

    $.Shortcuts = {};

    /** Начать реагировать на шорткаты. Навешиваем обработчики событий. */
    $.Shortcuts.start = function(list) {
        list = list || 'default';
        active = lists[list]; // Устанавливаем список шорткатов активным

        if (!isStarted) {
            $(document).bind(($.browser.opera ? 'keypress' : 'keydown') + '.shortcuts', function(e) {
                if (e.type === 'keypress' && e.which >= 97 && e.which <= 122) {
                    e.which = e.which - 32;
                }
                if (!pressed[e.which]) {
                    run('down', e);
                }
                pressed[e.which] = true;
                run('hold', e);
            });

            $(document).bind('keyup.shortcuts', function(e) {
                pressed[e.which] = false;
                run('up', e);
            });

            isStarted = true;
        }
    };

    $.Shortcuts.stop = function() {
        $(document).unbind('keypress.shortcuts keydown.shortcuts keyup.shortcuts');
        isStarted = false;
    };

    /**
     * Добавить шорткат.
     * @param {Object}   params Параметры шортката.
     * @param {String}  [params.type] Тип события по которому будет срабатывать обработчик.
     *     Возможные значения:
     *     down – На нажатие клавиши (сочетания клавиш). Значение по умолчанию.
     *     up   – На отпускание клавиши.
     *     hold – На нажатие и удержание клавиши. Обработчик будет вызван сразу после нажатия
     *            и потом будет вызываться с некоторой периодичностью пока нажата клавиша.
     * 
     * @param {String}   params.mask Строка задающая сочетание клавиш.
     *     Примеры: 'Down', 'Esc', 'Shift+Up', 'ctrl+a'.
     *     Строка состоит из имен клавиш разделенных плюсами.
     *     Может быть не более одной клавиши отличной от Ctrl, Shift или Alt.
     *     Строка нечувствительна к регистру.
     * 
     * @param {Boolean} [params.enableInInput] Разрешить выполнение шортката внутри полей ввода. По умолчанию запрещено.
     * @param {Function} params.handler Обработчик события. В качестве первого параметра будет передан event object.
     * @param {String}  [params.list] В какой список добавить шорткат. По умолчанию шорткат заносится в список default.
     */
    $.Shortcuts.add = function(params) {
        if (!params.mask) { throw new Error("$.Shortcuts.add: required parameter 'params.mask' is undefined."); }
        if (!params.handler) { throw new Error("$.Shortcuts.add: required parameter 'params.handler' is undefined."); }

        params.type = params.type || 'down';
        params.list = params.list || 'default';

        var masks = params.mask.toLowerCase().replace(/\s+/g, '').split(',');

        $.each(masks, function(i, mask) {
            var maskObj = getMaskObject(mask);
            var key = getKey(params.type, maskObj);

            if (!lists[params.list]) {
                lists[params.list] = {};
            }

            var list = lists[params.list];

            if (!list[key]) {
                list[key] = [];
            }

            list[key].push(params);
        });
    };

    /**
     * Удалить шорткат.
     * @param {Object}  params       Параметры.
     * @param {String} [params.type] Тип события (down|up|hold). По умолчанию down.
     * @param {String}  params.mask  Строка задающая сочетание клавиш.
     * @param {String} [params.list] Из какого списка удалить шорткат. По умолчанию default.
     */
    $.Shortcuts.remove = function(params) {
        if (!params.mask) { throw new Error("$.Shortcuts.remove: required parameter 'params.mask' is undefined."); }
        params.type = params.type || 'down';
        params.list = params.list || 'default';

        if (!lists[params.list]) { return; }

        var masks = params.mask.toLowerCase().replace(/\s+/g, '').split(',');

        $.each(masks, function(i, mask) {
            var maskObj = getMaskObject(mask);
            var key = getKey(params.type, maskObj);
            delete lists[params.list][key];
        });
    };

}(jQuery));