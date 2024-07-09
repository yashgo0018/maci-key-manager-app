import type { BigNumber, BigNumberish } from "@zk-kit/utils";
import {
  F1Field,
  bufferToBigInt,
  conversions,
  errorHandlers,
  isBigNumberish,
  requireTypes,
  scalar,
} from "@zk-kit/utils";
import { Buffer } from "buffer";
import { poseidon5 } from "poseidon-lite/poseidon5";
import {
  Base8,
  Point,
  inCurve,
  mulPointEscalar,
  packPoint,
  subOrder,
  unpackPoint,
} from "./baby-jubjub";
import { hash as blake, checkPrivateKey, isPoint, pruneBuffer } from "./utils";
const { requireBigNumberish } = errorHandlers;
const { bigNumberishToBigInt, leBufferToBigInt, leBigIntToBuffer } =
  conversions;

export type Signature<N = BigNumber> = {
  R8: Point<N>;
  S: N;
};

export function checkMessage(message: BigNumberish): bigint {
  requireTypes(message, "message", ["bignumberish", "string"]);

  if (isBigNumberish(message)) {
    return bigNumberishToBigInt(message);
  }

  return bufferToBigInt(Buffer.from(message as string));
}

export function signMessage(
  privateKey: Buffer | Uint8Array | string,
  message: BigNumberish
): Signature<bigint> {
  // Convert the private key to buffer.
  privateKey = checkPrivateKey(privateKey);

  // Convert the message to big integer.
  message = checkMessage(message);

  const hash = blake(privateKey);

  const sBuff = pruneBuffer(hash.slice(0, 32));
  const s = leBufferToBigInt(sBuff);
  const A = mulPointEscalar(Base8, scalar.shiftRight(s, BigInt(3)));

  const msgBuff = leBigIntToBuffer(message as bigint, 32);

  const rBuff = blake(Buffer.concat([hash.slice(32, 64), msgBuff]));

  const Fr = new F1Field(subOrder);
  const r = Fr.e(leBufferToBigInt(rBuff));

  const R8 = mulPointEscalar(Base8, r);
  const hm = poseidon5([R8[0], R8[1], A[0], A[1], message]);
  const S = Fr.add(r, Fr.mul(hm, s));

  return { R8, S };
}

/**
 * Derives a secret scalar from a given EdDSA private key.
 *
 * This process involves hashing the private key with Blake1, pruning the resulting hash to retain the lower 32 bytes,
 * and converting it into a little-endian integer. The use of the secret scalar streamlines the public key generation
 * process by omitting steps 1, 2, and 3 as outlined in RFC 8032 section 5.1.5, enhancing circuit efficiency and simplicity.
 * This method is crucial for fixed-base scalar multiplication operations within the correspondent cryptographic circuit.
 * For detailed steps, see: {@link https://datatracker.ietf.org/doc/html/rfc8032#section-5.1.5}.
 * For example usage in a circuit, see: {@link https://github.com/semaphore-protocol/semaphore/blob/2c144fc9e55b30ad09474aeafa763c4115338409/packages/circuits/semaphore.circom#L21}
 *
 * The private key must be an instance of Buffer, Uint8Array or a string. The input will be used to
 * generate entropy and there is no limit in size.
 * The string is used as a set of raw bytes (in UTF-8) and is typically used to pass passwords or secret messages.
 * If you want to pass a bigint, a number or a hexadecimal, be sure to convert them to one of the supported types first.
 * The 'conversions' module in @zk-kit/utils provides a set of functions that may be useful in case you need to convert types.
 *
 * @param privateKey The EdDSA private key for generating the associated public key.
 * @returns The derived secret scalar to be used to calculate public key and optimized for circuit calculations.
 */
export function deriveSecretScalar(
  privateKey: Buffer | Uint8Array | string
): bigint {
  // Convert the private key to buffer.
  privateKey = checkPrivateKey(privateKey);

  let hash = blake(privateKey);

  hash = hash.slice(0, 32);
  hash = pruneBuffer(hash);

  return scalar.shiftRight(leBufferToBigInt(hash), BigInt(3)) % subOrder;
}

/**
 * Derives a public key from a given private key using the
 * {@link https://eips.ethereum.org/EIPS/eip-2494|Baby Jubjub} elliptic curve.
 * This function utilizes the Baby Jubjub elliptic curve for cryptographic operations.
 * The private key should be securely stored and managed, and it should never be exposed
 * or transmitted in an unsecured manner.
 *
 * The private key must be an instance of Buffer, Uint8Array or a string. The input will be used to
 * generate entropy and there is no limit in size.
 * The string is used as a set of raw bytes (in UTF-8) and is typically used to pass passwords or secret messages.
 * If you want to pass a bigint, a number or a hexadecimal, be sure to convert them to one of the supported types first.
 * The 'conversions' module in @zk-kit/utils provides a set of functions that may be useful in case you need to convert types.
 *
 * @param privateKey The private key used for generating the public key.
 * @returns The derived public key.
 */
export function derivePublicKey(
  privateKey: Buffer | Uint8Array | string
): Point<bigint> {
  const s = deriveSecretScalar(privateKey);

  return mulPointEscalar(Base8, s);
}

/**
 * Converts a given public key into a packed (compressed) string format for efficient transmission and storage.
 * This method ensures the public key is valid and within the Baby Jubjub curve before packing.
 * @param publicKey The public key to be packed.
 * @returns A string representation of the packed public key.
 */
export function packPublicKey(publicKey: Point): bigint {
  if (!isPoint(publicKey) || !inCurve(publicKey)) {
    throw new Error("Invalid public key");
  }

  // Convert the public key values to big integers for calculations.
  const _publicKey: Point<bigint> = [
    BigInt(publicKey[0]),
    BigInt(publicKey[1]),
  ];

  return packPoint(_publicKey);
}

/**
 * Unpacks a public key from its packed string representation back to its original point form on the Baby Jubjub curve.
 * This function checks for the validity of the input format before attempting to unpack.
 * @param publicKey The packed public key as a bignumberish.
 * @returns The unpacked public key as a point.
 */
export function unpackPublicKey(publicKey: BigNumberish): Point<bigint> {
  requireBigNumberish(publicKey, "publicKey");

  const unpackedPublicKey = unpackPoint(bigNumberishToBigInt(publicKey));

  if (unpackedPublicKey === null) {
    throw new Error("Invalid public key");
  }

  return unpackedPublicKey;
}
