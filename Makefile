.PHONY: build

SOURCES = $(shell find src/ -type f -name "*.js") package.json
TARGET = dist/lightstep-overlay.js

build: $(TARGET)
$(TARGET): $(SOURCES)
	npm run webpack
