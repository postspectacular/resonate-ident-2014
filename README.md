# Resonate 2014 responsive identity

[resonate.io](http://resonate.io/)

JS version of physics driven kinetic typography system using canvas &
mouse/touch events to manipulate attractors.

## Building

This project has no external runtime dependencies, but requires the
[Google Closure library](https://code.google.com/p/closure-library/) &
[compiler](https://code.google.com/p/closure-compiler/) to build. Edit
the location of both in the supplied `./build.sh` script before
running. Compiled JS will stored in a timestamped file in `out/`.

After building, manually edit the `<script>` tag in the
`out/index.html` file to reference latest version...

## License

Copyright © 2013 Anything Labs Ltd.

Distributed under the Apache Software License 2.0. The licence text
can be found in the `LICENSE` file at the root of this distribution.
