/**
 * @module mutf-8
 * @copyright 2020 sciencesakura
 * @license MIT
 */

/**
 * The decoder for Modified UTF-8 (MUTF-8).
 *
 * @see {@link https://encoding.spec.whatwg.org/}
 */
export class MUtf8Decoder implements TextDecoder {
  static #ERR_DECODE_FAILED = "MUtf8Decoder.decode: Decoding failed.";

  #fatal: boolean;

  #ignoreBOM: boolean;

  /**
   * @returns always `"mutf-8"`
   */
  get encoding(): string {
    return "mutf-8";
  }

  /**
   * @returns `true` if error mode is fatal, otherwise `false`
   */
  get fatal(): boolean {
    return this.#fatal;
  }

  /**
   * @returns whether to ignore the BOM or not
   */
  get ignoreBOM(): boolean {
    return this.#ignoreBOM;
  }

  /**
   * @param label   The label of the encoder. This must be `"mutf-8"` or `"mutf8"`.
   * @param options The options.
   * @throws {RangeError} If the `label` is invalid value.
   */
  constructor(label: string = "mutf-8", options: TextDecoderOptions = {}) {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel !== "mutf-8" && normalizedLabel !== "mutf8") {
      throw new RangeError(`MUtf8Decoder.constructor: '${label}' is not supported.`);
    }
    this.#fatal = options.fatal ?? false;
    this.#ignoreBOM = options.ignoreBOM ?? false;
  }

  /**
   * Decodes the specified bytes.
   *
   * @param input   The bytes to be decoded.
   * @param options The options. This parameter is ignored.
   * @returns The resultant string.
   * @throws {TypeError} If the `input` is invalid bytes.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  decode(input: AllowSharedBufferSource, options: TextDecodeOptions = {}): string {
    const buf = input instanceof Uint8Array ? input : new Uint8Array("buffer" in input ? input.buffer : input);
    const length = buf.length;
    const chars: string[] = [];
    let p = 0;
    while (p < length) {
      const b1 = buf[p++];
      if (!(b1 & 0x80) && b1 !== 0) {
        // U+0001-007F
        chars.push(String.fromCharCode(b1));
      } else if (b1 >>> 5 === 0b110) {
        // U+0000, U+0080-07FF
        if (length <= p) throw new TypeError(MUtf8Decoder.#ERR_DECODE_FAILED);
        const b2 = buf[p++];
        if (b2 >>> 6 !== 0b10) throw new TypeError(MUtf8Decoder.#ERR_DECODE_FAILED);
        chars.push(String.fromCharCode(((b1 & 0x1f) << 6) | (b2 & 0x3f)));
      } else if (b1 >>> 4 === 0b1110) {
        // U+0800-
        if (length <= p + 1) throw new TypeError(MUtf8Decoder.#ERR_DECODE_FAILED);
        const b2 = buf[p++];
        const b3 = buf[p++];
        if (b2 >>> 6 !== 0b10 || b3 >>> 6 !== 0b10) throw new TypeError(MUtf8Decoder.#ERR_DECODE_FAILED);
        chars.push(String.fromCharCode(((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f)));
      } else {
        throw new TypeError(MUtf8Decoder.#ERR_DECODE_FAILED);
      }
    }
    return chars.join("");
  }
}

/**
 * The encoder for Modified UTF-8 (MUTF-8).
 *
 * @see {@link https://encoding.spec.whatwg.org/}
 */
export class MUtf8Encoder implements TextEncoder {
  /**
   * @returns always `"mutf-8"`
   */
  get encoding(): string {
    return "mutf-8";
  }

  /**
   * Encodes the specified string in MUTF-8.
   *
   * @param input The string to be encoded.
   * @returns The resultant bytes.
   */
  encode(input = ""): Uint8Array {
    const bin: number[] = [];
    for (const c of input) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const code = c.codePointAt(0)!;
      if (0x0001 <= code && code <= 0x007f) {
        bin.push(code);
      } else if (code <= 0x07ff) {
        bin.push(0xc0 | (code >>> 6));
        bin.push(0x80 | (0x3f & code));
      } else if (code <= 0xffff) {
        bin.push(0xe0 | (code >>> 12));
        bin.push(0x80 | (0x3f & (code >>> 6)));
        bin.push(0x80 | (0x3f & code));
      } else {
        bin.push(0xed);
        bin.push(0xa0 | ((code >>> 16) - 1));
        bin.push(0x80 | (0x3f & (code >>> 10)));
        bin.push(0xed);
        bin.push(0xb0 | (0x0f & (code >>> 6)));
        bin.push(0x80 | (0x3f & code));
      }
    }
    return new Uint8Array(bin);
  }

  /**
   * Encodes the specified string in MUTF-8 and stores the result to the specified array.
   *
   * @param source      The string to be encoded.
   * @param destination The bytes to be stored the result.
   * @returns The progress.
   */
  encodeInto(source: string, destination: Uint8Array): TextEncoderEncodeIntoResult {
    const destLen = destination.length;
    let i = 0;
    let read = 0;
    for (const c of source) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const code = c.codePointAt(0)!;
      if (0x0001 <= code && code <= 0x007f) {
        if (destLen <= i) break;
        destination[i++] = code;
      } else if (code <= 0x07ff) {
        if (destLen <= i + 1) break;
        destination[i++] = 0xc0 | (code >>> 6);
        destination[i++] = 0x80 | (0x3f & code);
      } else if (code <= 0xffff) {
        if (destLen <= i + 2) break;
        destination[i++] = 0xe0 | (code >>> 12);
        destination[i++] = 0x80 | (0x3f & (code >>> 6));
        destination[i++] = 0x80 | (0x3f & code);
      } else {
        if (destLen <= i + 5) break;
        destination[i++] = 0xed;
        destination[i++] = 0xa0 | ((code >>> 16) - 1);
        destination[i++] = 0x80 | (0x3f & (code >>> 10));
        destination[i++] = 0xed;
        destination[i++] = 0xb0 | (0x0f & (code >>> 6));
        destination[i++] = 0x80 | (0x3f & code);
        read++;
      }
      read++;
    }
    return { read, written: i };
  }
}
