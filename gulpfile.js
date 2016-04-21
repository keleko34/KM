var gulp = require('gulp')
  , prompt = require('gulp-prompt')
  , inject = require('gulp-inject')
  , sort = require('sort-stream')
  , replace = require('gulp-replace')
  , file = require('gulp-file')
  , closureCompiler = require('gulp-closure-compiler')
  , fs = require('fs')

gulp.task('build', function(){

        var ignorePath = ['./KM.js','./Build/KM.js','./Min/KM.min.js']
          , subFiles = gulp.src(['./KM/**/*.js']).pipe(sort(function(a,b){
            return 1;
          }))
          , reD = /(define)(.*)(function\()(.*)(\))(.*)(?:{)/
          , reE = /}\)(?![\s\S]*}\))/m;
        gulp.src('./KM/KM.js')
        .pipe(inject(subFiles,{
          relative:true,
          starttag: '/* BUILD SECTION */',
          endtag: '/* END BUILD SECTION */',
          transform: function(filepath,file,i,length){
            if(ignorePath.indexOf('./'+filepath) < 0)
            {
              console.log('\033[36mInjecting File:\033[37m',filepath);
              var contents = file.contents.toString('utf8'),
                  re = /(function Create)(.*)(\()/,
                  module = 'Create'+re.exec(contents)[2];

              contents = contents.replace(reE,"}());");
              contents = contents.replace(reD,"var "+module+" = (function(){");
              return contents;
            }
            else
            {
              return "";
            }
          },
          ignorePath:ignorePath
        }))
        .pipe(replace(reE,"}())"))
        .pipe(replace(reD,("var CreateKM = (function(){")))
        .pipe(gulp.dest('./KM/Build'));

        console.log('\033[36mRunning clojure compiler minification:\033[37m');

         gulp.src('./KM/Build/KM.js')
        .pipe(closureCompiler({
          compilerPath:"./compiler.jar",
          fileName:"KM.min.js"
        }))
        .pipe(gulp.dest('./KM/Min'));
  return
});
