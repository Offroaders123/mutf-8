/**
 * @module mutf-8
 * @copyright 2020 sciencesakura
 * @license MIT
 */

/**
 * The decoder for Modified UTF-8.
 *
 * @example
 * ```ts
 * const src = new Uint8Array([
 *   0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0xe4, 0xb8,
 *   0x96, 0xe7, 0x95, 0x8c, 0x21,
 * ]);
 * const decoder = new MUtf8Decoder();
 * const text = decoder.decode(src);
 * // Hello 世界!
 * ```
 *
 * @see {@link https://encoding.spec.whatwg.org/}
 */
export class MUtf8Decoder extends TextDecoder {
  override readonly encoding = "mutf-8";

  /**
   * @param label   - The label of the encoder. Must be `"mutf-8"` or `"mutf8"`.
   * @param options - The options.
   * @throws {RangeError} If the `label` is invalid value.
   */
  constructor(label: string = "mutf-8", options: TextDecoderOptions = {}) {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel !== "mutf-8" && normalizedLabel !== "mutf8") {
      throw new RangeError(`MUtf8Decoder.constructor: '${label}' is not supported.`);
    }
    super("utf-8",options);
  }

  override decode(input: AllowSharedBufferSource, options: TextDecodeOptions = {}): string {
    return super.decode(input,options);
  }
}

/**
 * The encoder for Modified UTF-8 (MUTF-8).
 *
 * @example
 * ```ts
 * const encoder = new MUtf8Encoder();
 * const code = encoder.encode("Hello 世界!");
 * // Uint8Array [
 * //   0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0xe4, 0xb8,
 * //   0x96, 0xe7, 0x95, 0x8c, 0x21,
 * // ]
 * ```
 *
 * @see {@link https://encoding.spec.whatwg.org/}
 */
export class MUtf8Encoder extends TextEncoder {
  /**
   * Returns "mutf-8".
   */
  override readonly encoding = "mutf-8";

  /**
   * Returns the result of running MUTF-8's encoder.
   */
  override encode(input?: string): Uint8Array {
    return super.encode(input);
  }

  /**
   * Runs the MUTF-8 encoder on source, stores the result of that operation into destination, and returns the progress made as an object wherein read is the number of converted code units of source and written is the number of bytes modified in destination.
   */
  override encodeInto(source: string, destination: Uint8Array): TextEncoderEncodeIntoResult {
    return super.encodeInto(source,destination);
  }
}
