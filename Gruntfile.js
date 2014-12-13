/* global module:false */
module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner:
        '/*!\n' +
        ' * Planning Poker <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd, HH:MM") %>)\n' +
        ' * http://bitbucket.org/colinbate/transient-poker\n' +
        ' * MIT licensed\n' +
        ' *\n' +
        ' * Copyright (C) <%= grunt.template.today("yyyy") %> Colin Bate, http://colinbate.com\n' +
        ' */\n'
    },
    jshint: {
      options: {
        bitwise: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        nonew: true,
        plusplus: true,
        quotmark: true,
        sub: true,
        strict: true,
        undef: true,
        unused: true,
        trailing: true,
        eqnull: true,
        browser: true,
        expr: true,
        globals: {
          define: false,
          require: false,
          module: false
        }
      },
      product: ['*.js', 'src/*.js', 'src/modules/**/*.js']
    },
    less: {
      dev: {
        options: {
          sourceMap: true,
        },
        files: {
          'src/poker.css': 'src/less/poker.less'
        }
      },
      clean: {
        files: {
          'src/poker.css': 'src/less/poker.less'
        }
      }
    },
    replace: {
      version: {
        src: ['src/index.html'],
        dest: 'dist/<%= pkg.version %>/index.html',             // destination directory or file
        replacements: [{
          from: /v\d+\.\d+\.\d+(-[a-z0-9]+)?/,                   // string replacement
          to: 'v<%= pkg.version %>'
        },{
          from: 'poker.css',
          to: 'poker.<%= pkg.version %>.css'
        },{
          from: 'main.js',
          to: 'main.<%= pkg.version %>.js'
        }]
      }
    },
    watch: {
      less: {
        files: ['src/less/**/*.less'],
        tasks: 'less:dev'
      },
      js: {
        files: ['*.js', 'src/*.js', 'src/modules/**/*.js'],
        tasks: 'jshint:product'
      }
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: 'src',
          optimizeCss: 'none',
          mainConfigFile: 'src/main.js',
          optimize: 'none',
          findNestedDependencies: true,
          removeCombined: true,
          paths: {
            'pubnub': 'empty:',
            'mithril': 'empty:',
          },
          name: 'main',
          out: 'build/main.js'
        }
      }
    },
    uglify: {
      js: {
        options: {
          banner: '<%= meta.banner %>',
          preserveComments: false
        },
        files: {
          'dist/<%= pkg.version %>/main.<%= pkg.version %>.js': ['build/main.js']
        }
      },
    },
    csso: {
      options: {
        banner: '<%= meta.banner %>',
        report: 'min'
      },
      core: {
        files: {
          'dist/<%= pkg.version %>/poker.<%= pkg.version %>.css': ['src/poker.css']
        }
      }
    },
    clean: ['build', 'dist/<%= pkg.version %>']
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-csso');

  grunt.registerTask('default', ['jshint', 'less:dev']);
  grunt.registerTask('pack', ['jshint', 'less:clean', 'clean', 'csso', 'requirejs', 'uglify', 'replace']);
};
