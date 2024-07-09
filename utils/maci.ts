import { Buffer } from "buffer";
import { getRandomBytes } from "expo-crypto";
import { derivePublicKey, packPublicKey, unpackPublicKey } from "./zk-kit";

export const unpackPubKey = (packed: bigint) => {
  const pubKey = unpackPublicKey(packed);
  return pubKey.map((x) => BigInt(x));
};

/**
 * Generate a private key
 * @returns A random seed for a private key.
 */
export const genPrivKey = (): bigint =>
  BigInt(`0x${Buffer.from(getRandomBytes(32)).toString("hex")}`);

export const packPubKey = (pubKey: any): bigint =>
  BigInt(packPublicKey(pubKey as any));

/**
 * @param privKey A private key generated using genPrivKey()
 * @returns A public key associated with the private key
 */
export const genPubKey = (privKey: any) => {
  const key = derivePublicKey(privKey.toString());
  return [BigInt(key[0]), BigInt(key[1])];
};

/**
 * Generates a keypair.
 * @returns a keypair
 */
export const genKeypair = () => {
  const privKey = genPrivKey();
  const pubKey = genPubKey(privKey);

  const keypair = { privKey, pubKey };

  return keypair;
};

export const SERIALIZED_PRIV_KEY_PREFIX = "macisk.";

import assert from "assert";

export const SERIALIZED_PUB_KEY_PREFIX = "macipk.";

/**
 * @notice A class representing a public key
 * This is a MACI public key, which is not to be
 * confused with an Ethereum public key.
 * A serialized MACI public key is prefixed by 'macipk.'
 * A raw MACI public key can be thought as a pair of
 * BigIntegers (x, y) representing a point on the baby jubjub curve
 */
export class PubKey {
  rawPubKey: any;

  /**
   * Create a new instance of a public key
   * @dev You might want to allow an invalid raw key,
   * as when decrypting invalid messages, the public key data
   * will be random, and likely not be a point on the curve.
   * However we need to match keys to the circuit which does
   * not perform such checks
   * @param rawPubKey the raw public key
   * @param allowInvalid whether to allow invalid public keys
   */
  constructor(rawPubKey: any, allowInvalid = false) {
    if (!allowInvalid) {
      // assert(inCurve(rawPubKey), "PubKey not on curve");
    }
    this.rawPubKey = rawPubKey;
  }

  /**
   * Create a copy of the public key
   * @returns a copy of the public key
   */
  copy = (): PubKey =>
    new PubKey([
      BigInt(this.rawPubKey[0].toString()),
      BigInt(this.rawPubKey[1].toString()),
    ]);

  /**
   * Return this public key as circuit inputs
   * @returns an array of strings
   */
  asCircuitInputs = (): string[] =>
    this.rawPubKey.map((x: any) => x.toString());

  /**
   * Return this public key as an array of bigints
   * @returns the public key as an array of bigints
   */
  asArray = (): bigint[] => [this.rawPubKey[0], this.rawPubKey[1]];

  /**
   * Generate a serialized public key from this public key object
   * @returns the string representation of a serialized public key
   */
  serialize = (): string => {
    const packed = packPubKey(this.rawPubKey).toString(16);

    if (packed.length % 2 !== 0) {
      return `${SERIALIZED_PUB_KEY_PREFIX}0${packed}`;
    }

    return `${SERIALIZED_PUB_KEY_PREFIX}${packed}`;
  };

  /**
   * Check whether this public key equals to another public key
   * @param p the public key to compare with
   * @returns whether they match
   */
  equals = (p: PubKey): boolean =>
    this.rawPubKey[0] === p.rawPubKey[0] &&
    this.rawPubKey[1] === p.rawPubKey[1];

  /**
   * Deserialize a serialized public key
   * @param s the serialized public key
   * @returns the deserialized public key
   */
  static deserialize = (s: string): PubKey => {
    const len = SERIALIZED_PUB_KEY_PREFIX.length;
    return new PubKey(unpackPubKey(BigInt(`0x${s.slice(len).toString()}`)));
  };

  /**
   * Check whether a serialized public key is serialized correctly
   * @param s the serialized public key
   * @returns whether the serialized public key is valid
   */
  static isValidSerializedPubKey = (s: string): boolean => {
    const correctPrefix = s.startsWith(SERIALIZED_PUB_KEY_PREFIX);

    try {
      PubKey.deserialize(s);
      return correctPrefix;
    } catch {
      return false;
    }
  };
}

/**
 * @notice PrivKey is a TS Class representing a MACI PrivateKey
 * which is a seed to be used to generate a public key (point on the curve)
 * This is a MACI private key, which is not to be
 * confused with an Ethereum private key.
 * A serialized MACI private key is prefixed by 'macisk.'
 */
export class PrivKey {
  rawPrivKey: any;

  /**
   * Generate a new Private key object
   * @param rawPrivKey the raw private key (a bigint)
   */
  constructor(rawPrivKey: any) {
    this.rawPrivKey = rawPrivKey;
  }

  /**
   * Create a copy of this Private key
   * @returns a copy of the Private key
   */
  copy = (): PrivKey => new PrivKey(BigInt(this.rawPrivKey.toString()));

  /**
   * Serialize the private key
   * @returns the serialized private key
   */
  serialize = (): string => {
    let x = this.rawPrivKey.toString(16);
    if (x.length % 2 !== 0) {
      x = `0${x}`;
    }

    return `${SERIALIZED_PRIV_KEY_PREFIX}${x.padStart(64, "0")}`;
  };

  /**
   * Deserialize the private key
   * @param s the serialized private key
   * @returns the deserialized private key
   */
  static deserialize = (s: string): PrivKey => {
    const x = s.slice(SERIALIZED_PRIV_KEY_PREFIX.length);
    return new PrivKey(BigInt(`0x${x}`));
  };

  /**
   * Check if the serialized private key is valid
   * @param s the serialized private key
   * @returns whether it is a valid serialized private key
   */
  static isValidSerializedPrivKey = (s: string): boolean => {
    const correctPrefix = s.startsWith(SERIALIZED_PRIV_KEY_PREFIX);
    const x = s.slice(SERIALIZED_PRIV_KEY_PREFIX.length);

    return correctPrefix && x.length === 64;
  };
}

/**
 * @notice A KeyPair is a pair of public and private keys
 * This is a MACI keypair, which is not to be
 * confused with an Ethereum public and private keypair.
 * A MACI keypair is comprised of a MACI public key and a MACI private key
 */
export class Keypair {
  privKey: PrivKey;

  pubKey: PubKey;

  /**
   * Create a new instance of a Keypair
   * @param privKey the private key (optional)
   * @notice if no privKey is passed, it will automatically generate a new private key
   */
  constructor(privKey?: PrivKey) {
    if (privKey) {
      this.privKey = privKey;
      this.pubKey = new PubKey(genPubKey(privKey.rawPrivKey) as any);
    } else {
      const rawKeyPair = genKeypair();
      this.privKey = new PrivKey(rawKeyPair.privKey);
      this.pubKey = new PubKey(rawKeyPair.pubKey);
    }
  }

  /**
   * Create a deep clone of this Keypair
   * @returns a copy of the Keypair
   */
  copy = (): Keypair => new Keypair(this.privKey.copy());

  /**
   * Check whether two Keypairs are equal
   * @param keypair the keypair to compare with
   * @returns whether they are equal or not
   */
  equals(keypair: Keypair): boolean {
    const equalPrivKey = this.privKey.rawPrivKey === keypair.privKey.rawPrivKey;
    const equalPubKey =
      this.pubKey.rawPubKey[0] === keypair.pubKey.rawPubKey[0] &&
      this.pubKey.rawPubKey[1] === keypair.pubKey.rawPubKey[1];

    // If this assertion fails, something is very wrong and this function
    // should not return anything
    // eslint-disable-next-line no-bitwise
    assert(!(+equalPrivKey ^ +equalPubKey));

    return equalPrivKey;
  }
}
