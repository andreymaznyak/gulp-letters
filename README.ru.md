# Gulp Letters
Библиотека для верстки и тестирования писем.

\* Read this in other languages: [English](README.md), [Русский](README.ru.md),

- - - -

## Что такое Gulp Letters / What is Gulp Letters
Основная задача библиотеки gulp-letters – это свести всю верстку писем к работе с двумя базовыми файлами .pug (разметка) и .sass (стили).  
Live Preview в браузере, отправка писем на почту, конвертация файлов в html и css, вставка стилей в файл разметки и сборка готового письма  — все это сделает gulp-letters автоматически.

**Как итог:** максимальная простота разработки и поддержки писем + возможность быстрого тестирования и сборки готовых шаблонов.

- - - -

## Возможности / Features

### Работа с файлами по имени

> Имя файла является **центральным идентификатором** в работе с gulp-letters.  
>   
> Создайте новый файл через команду `gulp new -n <имя файла>`  и далее используйте <имя файла> для всех операций:  отправляйте на почтовый ящик, открывайте в браузере, делайте сборку, удаляйте → все через gulp команды с указанием одного только имени.  

Это позволяет вести разработку сразу нескольких писем, обращаясь к ним по заданному вами имени.

Прописав: `gulp <имя команды> -n <имя письма>`,  вы указываете gulp файл, к которому нужно применить команду.

Например, вы создали письмо с именем *code*. Прописываете `gulp serve -n code` → gulp открывает в браузере письмо с именем *code* и начинает отслеживать изменения в code.pug и code.sass. Как только вы сохраните code.pug или code.sass – gulp автоматически обновит вкладку с code письмом в браузере.

### Создание базового .pug и .sass
Для старта верстки писем необходимо создать файл базовый .pug файл и файл со стилями .sass. Это выполняется одной командой: 
`gulp new -n <имя файла>`. 

![](https://2.downloader.disk.yandex.ru/disk/516dc8f045902feb3bd57b4a97779b330ea5fda60cc63186c64d6bf524867761/5a7ae5f7/2ARVim4y-a6CucIAG6v67E24rqPXQEgq-0-_6oay5jmoLOcdHumhQz4vE3OlXKPBHwORYQLdLry7mxS0mbgQ6w%3D%3D?uid=0&filename=2018-02-07%2015.32.43.gif&disposition=inline&hash=&limit=0&content_type=image%2Fgif&fsize=39166&hid=016151aa5e4837f1780f689180acc5ed&media_type=image&tknv=v2&etag=97907788cdb5c1e4ae5bcc02076cee7e)

### Live Preview в браузере при сохранении изменений в .pug или .sass
Для старта превью сверстанного письма в браузере нужно выполнить команду `gulp serve -n <имя файла>`. Для реализации live preview используется библиотека BrowserSync.

#### Конвертация .pug и .sass в html и css
При использовании команды  `gulp serve -n <имя файла>`  gulp-letters автоматически создаст папку dev/ и положит в нее конвертированные из .pug и .sass и файлы .html и .css.

![](https://1.downloader.disk.yandex.ru/disk/7c66857c18422903245e3731d481f6455960f9488f1ec4e5e9c8d1b409ec2937/5a7ae659/2ARVim4y-a6CucIAG6v67F3DMmsByVSJ-JqHwD-57CsMXdIkIv4w4YCOropc4xt7eU8hs7E7FxWX6zZvOhVTlw%3D%3D?uid=0&filename=2018-02-07%2015.53.21.gif&disposition=inline&hash=&limit=0&content_type=image%2Fgif&fsize=154337&hid=1e5801ca789854d808dd450ff1d08c90&media_type=image&tknv=v2&etag=857ab1293211688b2e823a16496db662)

### Отправка писем на указанную почту
Любое письмо созданное в gulp-letters можно отправить но почту, прописав команду `gulp send -n test` .

#### Mail Config
Параметры SMTP сервера прописываются в gulpfile.js:
```
smtpServerConfig: {
	host: 'localhost', // smtp server host
	secure: false,
	port: 1025 // smtp server port
},
```

В gulpfile.js также нужно прописать данные для блока subjects, в котором содержится контейнер с информацией: email отправителя, получателя и тему письма
```
subjects: {
	default: {
  		from: '"Mail new message ✉️ " <no-replay@localhost>',
		to: 'test@user.com',
		subject: 'This is new message ✉️'
	}
},
```

Вы можете создать несколько контейнеров с информацией для рассылки, обращение к контейнерам происходит так же, как и к файлам — по имени через команду `send`.

Пример: `gulp send -n test` → gulp запустит отправку письма с именем test на данные из контейнера test. 

> Если контейнера с именем test не обнаружится, то gulp отправит письмо, используя данные из default контейнера.  
 

### Сборка писем
Сборка писем осуществляется через команду `gulp build -n <имя файла>`.

#### Что происходит во время сборки
1. Gulp берет разметку и стили из указанных .html и css → прописывает их инлайн;
2. Конвертирует полученный файл в .js и присваивает ему имя, указанное в п. Создание базового .pug и .sass;
3. Создает папку dist/, кладет в нее созданный .js файл.

### clean / remove
`gulp clean` – очищает папку dist  
`gulp remove -n test` – удаляет все файлы с именем test из всех папок, где развернут gulp-letters.

- - - -

## Установка
1. Создайте папку проекта со структурой  
src/  
↳ sass/  
2. Перейдите в корень папки и выполните команду `npm init` или, если вы используеьте yarn, `yarn init`;
3. В корне папки выполните команду `touch gulpfile.js`;
4. Откройте gulpfile.js и поместите в него:
```
const gulp = require('gulp');
// include default tasks registrator
const registerTasks = require('gulp-letters').registerTasks;
// define smtp config
const smtpOptions = {
  // nodemailer smtp settings
  smtpServerConfig: {
    host: 'localhost', // smtp server host
    secure: false,
    port: 1025 // smtp server port
  },
  subjects: {
    // define letters subjects
    default: {
      from: '"Mail new message ✉️ " <no-replay@localhost>',
      to: 'test@user.com',
      subject: 'This is new message ✉️'
    }
  },
  params: {} // define letters params
};

// register default tasks
registerTasks({ smtpOptions }, [
  'new',
  'serve',
  'build',
  'send',
  'clean',
  'remove'
]);
// define default gulp task
gulp.task('default', gulp.series(['build']));
```
5. Выполните команду `npm install --save-dev gulp-letters` или, если вы используеьте yarn, `yarn add gulp-letters -D`

Gulp-letters библиотека готова к работе.  Для проверки работоспособности — выполните команду `gulp new -n test` и далее `gulp serve -n test` → результат: в браузере откроется тестовое письмо с надписью ::Hello letter test::.

- - - -

## Команды
На примере файла с именем test.

#### new
`gulp new -n test` или `gulp new -n "test1","test2"` — автоматическое создание test.pug и test.sass, где test может быть переименован по желанию.

#### serve
`gulp serve -n test`  — происходит конвертация test.pug в test.html,  test.sass в test.css, все это помещается в папку dev – оттуда файлы подхватывает BrowserSync и разворачивает браузере на localhost.

#### build
`gulp build -n test`  – test.pug и test.sass собираются в один JS файл, стили вставляются инлайново. Созданный test.js – может размещаться в проекте.

#### send
`gulp send -n test` – отправка письма с именем test на указанный в mail-config.json адрес.

#### clean / remove
`gulp clean` – очищает папку dist  
`gulp remove -n test` – удаляет все файлы с именем test из всех папок, где развернут gulp-letters.

- - - -

## Требования

#### Структура папок проекта

src – разработка
↳ sass

dev - файлы для проверки на локальном сервере (html + css)
↳ css

dist – собранные файлы для размещения (JS — стили инлайн)

#### Gulp 4.0
Для работы gulp-letters требуется gulp 4.0.0 (и выше).
