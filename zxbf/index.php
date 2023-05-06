
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charSet="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta http-equiv="Cache-Control" content="no-transform" /> 
    <meta http-equiv="Cache-Control" content="no-siteapp" />
    <meta name="referrer" content="never">
    <meta name="renderer" content="webkit" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>性感小姐姐在线随机播放</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <section id="main">
        <video id="player" src="https://v.api.aa1.cn/api/api-dy-girl/index.php?aa1=ajdu987hrjfw" controls webkit-playsinline playsinline></video>
    </section>
    <section id="buttons">
        <button id="switch">自动切换</button>
        <button id="next">下一位</button>
    </section>
    <script>
    (function (window, document) {
        if (top != self) {
            window.top.location.replace(self.location.href);
        }
        var get = function (id) {
            return document.getElementById(id);
        }
        var bind = function (element, event, callback) {
            return element.addEventListener(event, callback);
        }
        var auto = true;
        var player = get('player');
        var randomm = function () {
            player.src = 'https://v.api.aa1.cn/api/api-dy-girl/index.php?aa1=ajdu987hrjfw';
            player.play();
        }
        bind(get('next'), 'click', randomm);
        bind(player, 'error', function () {
            randomm();
        });
        bind(get('switch'), 'click', function () {
            auto = !auto;
            this.innerText = '自动: ' + (auto ? '开' : '关');
        });
        bind(player, 'ended', function () {
            if (auto) randomm();
        });
    })(window, document);
    </script>
</body>
</html>