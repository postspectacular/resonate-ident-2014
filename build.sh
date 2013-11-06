#!/bin/bash
CLOSURE_HOME=~/dev/js/closure-library/closure
COMPILER_JAR=~/dev/js/closure-compiler/compiler.jar
VERSION=`date +%Y%m%d-%H%M`
REPO_URL=http://code.thi.ng/resonate2014-ident
AUTHOR=k@thi.ng
python $CLOSURE_HOME/bin/build/closurebuilder.py \
--root=$CLOSURE_HOME \
--root=src \
--root=$CLOSURE_HOME/../third_party \
--namespace="thi.ng.resonate.Logo" \
--output_mode=compiled \
--compiler_jar=$COMPILER_JAR \
--compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
--compiler_flags="--warning_level=VERBOSE" \
--compiler_flags="--generate_exports" \
--compiler_flags="--property_map_output_file=pmap-gen.txt" \
--compiler_flags="--variable_map_output_file=vmap-gen.txt" \
--compiler_flags="--output_wrapper=/* v$VERSION -- (c) 2013 Anything Labs (author: $AUTHOR) -- $REPO_URL */(function(){%output%})();" \
> out/logo$VERSION.prod.js

#--compiler_flags="--compilation_level=SIMPLE_OPTIMIZATIONS" \
#--compiler_flags="--compilation_level=WHITESPACE_ONLY" \
#--compiler_flags="--formatting=PRETTY_PRINT" \
