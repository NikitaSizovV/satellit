const scss = require('gulp-sass')(require('sass'));
scss.compiler = require('sass');
const webp = require('gulp-webp');
var gulp       = require('gulp'), // Подключаем Gulp
    browserSync  = require('browser-sync'), // Подключаем Browser Sync
    concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
    imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer'),// Подключаем библиотеку для автоматического добавления префиксов
    concat       = require('gulp-concat'),
    livereload = require('gulp-livereload');

     
gulp.task('webp', () =>
gulp.src('app/src/**/*.png')
    .pipe(webp())
    .pipe(gulp.dest('docs'))
);

gulp.task('scss', function() { // Создаем таск scss
    return gulp.src('app/scss/**/*.scss') // Берем источник
        .pipe(scss()) // Преобразуем scss в CSS посредством gulp-scss
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('app/css/compiled')) // Выгружаем результата в папку app/css
        .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
        server: { // Определяем параметры сервера
            baseDir: 'app' // Директория для сервера - app
        },
        notify: false // Отключаем уведомления
    });
});

gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
        'app/libs/jquery/docs/jquery.min.js', // Берем jQuery
        'app/libs/magnific-popup/docs/jquery.magnific-popup.min.js' // Берем Magnific Popup
        ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('code', function() {
    return gulp.src('app/*.html')
    .pipe(browserSync.reload({ stream: true }))
});

gulp.task('css-libs', function() {
    return gulp.src('app/css/libs.scss') // Выбираем файл для минификации
        .pipe(scss()) // Преобразуем scss в CSS посредством gulp-scss
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('clean', async function() {
    return del.sync('docs'); // Удаляем папку docs перед сборкой
});

gulp.task('img', function() {
    return gulp.src('app/src/**/*') // Берем все изображения из app
        .pipe(gulp.dest('docs/src')); // Выгружаем на продакшен
});

gulp.task('prebuild', async function() {

    var buildCss = gulp.src([ // Переносим библиотеки в продакшен
        'app/css/*.css'
        ])
    .pipe(gulp.dest('docs/css'))

    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('docs/fonts'))

    var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
    .pipe(gulp.dest('docs/js'))

    var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('docs'));

});
gulp.task('concat', function() {
    return gulp.src('app/css/compiled/*.css')
      .pipe(concat('style.css'))
      .pipe(gulp.dest('app/css'));
  });
gulp.task('clear', function (callback) {
    return cache.clearAll();
})

gulp.task('watch', function() {
    gulp.watch('app/scss/**/*.scss', gulp.parallel('scss')).on('change', browserSync.reload); // Наблюдение за scss файлами
    gulp.watch('app/*.html', gulp.parallel('code')).on('change', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('app/css/compiled/*.css', gulp.parallel('concat')).on('change', browserSync.reload);
});
gulp.task('default', gulp.parallel('scss', 'watch', 'browser-sync'));
gulp.task('build', gulp.parallel('prebuild', 'clean', 'img', 'scss'));