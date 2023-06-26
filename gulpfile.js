var gulp = require('gulp');
var zip = require('gulp-zip');

gulp.task('zip', function () {
    return gulp.src([
            'build/**/*',
            'README.md',
            'transcripts-block.php'
        ], {base: "."}) // Grabs all necessary files in the specified directories
        .pipe(zip('speech-bubble-transcript-plugin.zip')) // Name of your zip file
        .pipe(gulp.dest('dist')); // Destination directory
});
