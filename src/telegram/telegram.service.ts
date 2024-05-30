import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bigInt from 'big-integer';
import { randomBytes } from 'crypto';
import { Api, TelegramClient } from 'telegram';
import { returnBigInt, sha1, sha256 } from 'telegram/Helpers';
import { messageParse } from 'telegram/client';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import { StringSession } from 'telegram/sessions';
import * as crypto from 'crypto'

@Injectable()
export class TelegramService  {

    private client: TelegramClient
    private apiId: number
    private apiHash:string
    private sessionString:StringSession
    private dhConfig


    private powmod(base: number, exp: number, mod: number): number {
        if (exp === 0) return 1;
        if (exp % 2 === 0) {
          return Math.pow(this.powmod(base, exp / 2, mod), 2) % mod;
        } else {
          return (base * this.powmod(base, exp - 1, mod)) % mod;
        }
      }

    public checkGA(gA: number, p: number): boolean {
    console.log(gA, p);
    if (gA <= 1 || gA >= p - 1) {
        throw new Error('g_a is invalid (1 < g_a < p - 1 is false).');
    }
    // Ommited, because it just generates infinity as the value to check against
    // if (gA < 2 ** 1984 || gA >= p - 2 ** 1984) {
    //   throw new Error('g_a is invalid (1 < g_a < p - 1 is false).')
    // }
    
    return true;
    }

    public async getDhConfig(): Promise<Api.messages.DhConfig> {
        const dhConfig = await this.client.invoke(
          new Api.messages.GetDhConfig({
            version: 1234,
            randomLength: 0,
          }),
        );
      
        if (dhConfig instanceof Api.messages.DhConfigNotModified) {
          if (this.dhConfig === undefined) {
            throw new Error('dhConfig is undefined');
          }
          return this.dhConfig;
        } else {
          this.dhConfig = dhConfig;
          return this.dhConfig;
        }
      }

    constructor(private readonly config:ConfigService){
        
        this.apiId = Number(this.config.get('TELEGRAM_API_ID'))
        this.apiHash= this.config.get('TELEGRAM_API_HASH')
        this.sessionString = new StringSession(this.config.get('TELEGRAM_SESSION_STRING')) 
 

        this.client = new TelegramClient(this.sessionString,this.apiId,this.apiHash,{connectionRetries:5})
        this.client.connect()
    }


    public async handleNewChat(g_a:any) {
        // update = update as Api.UpdateEncryption;
        // const chat = update.chat as Api.EncryptedChatRequested;
      

      
        const dhConfig = await this.getDhConfig();
        const b = randomBytes(256).readUInt32BE(0);
        const gA = g_a;
        // const gA = chat.gA.readUInt32BE(0);
        const p = dhConfig.p.readUInt32BE(0);
        // this.checkGA(gA, p);
        const res = this.powmod(gA, b, p);
        const authKey = Buffer.alloc(256);
        authKey.writeUInt32BE(res, 0);
      
        // const keyFingerprint = bigInt(
        //   struct.unpack('<q', (await sha1(authKey)).subarray(-8))[0].toString(),
        // );
        // const inputPeer = new Api.InputEncryptedChat({
        //   chatId: chat.id,
        //   accessHash: chat.accessHash,
        // });
      
        const gB = this.powmod(dhConfig.g, b, p);
        // this.checkGA(gB, p);
      
        const gBBuffer = Buffer.alloc(256);
        gBBuffer.writeUInt32BE(gB, 0);
      
        // const result = await this.client.invoke(
        //   new Api.messages.AcceptEncryption({
        //     peer: inputPeer,
        //     gB: gBBuffer,
        //     keyFingerprint: keyFingerprint,
        //   }),
        // );
      
        return {
          gB,
          gBBuffer
        //   chat_id: String(chat.id),
        //   participants: [String(chat.adminId)],
        //   timestamp: ~~(Date.now() / 1000),
        //   metadata: {
        //     accessHash: chat.accessHash,
        //     authKey: authKey,
        //   },
        };
      }


    
  

    testCall= async()=>{

        function int_256_to_bytes(int: bigint) {
            const bytesArray = [];
            for (let i = 0; i < 32; i++) {
                let shift = int >> BigInt(8 * i)
                shift &= BigInt(255)
                bytesArray[i] = Number(String(shift))
            }
            return Buffer.from(bytesArray)
        }
        
        const dhc = await this.client.invoke(new Api.messages.GetDhConfig({
                randomLength: 256
            })) as Api.messages.DhConfig;
        
            
            
            const one = BigInt(1);
            const g = BigInt(dhc.g);
            const p = BigInt(`0x${dhc.p.toString('hex')}`)
            // this.client.invoke(
            //     new Api.phone.con
            // )
            let a = BigInt(0);
            while (a <= 1 && a >= p) {
                a = BigInt(`0x${randomBytes(256).toString('hex')}`);
            }
        
            const pp = dhc.p.readUInt32BE(0)

            const g_a = (g ** a) % p;
            const gB = this.powmod(dhc.g, randomBytes(256).readUInt32BE(0), pp )
            
            const shag_a = await sha256(int_256_to_bytes(g_a));




        const dhConfig = await this.client.invoke(new Api.messages.GetDhConfig({ version: 0, randomLength: 256 }));
          //@ts-ignore
        const dh = crypto.createDiffieHellman(dhConfig.p, 'hex', dhConfig.g, 'hex');
        const privateKey = dh.generateKeys();
        const publicKey = dh.getPublicKey();
        

        const call = await this.client.invoke(
                new Api.phone.RequestCall({
                    userId: "M1NATON",
                    randomId: 752100643,
                    gAHash: Buffer.from(shag_a),
                    protocol: new Api.PhoneCallProtocol({ 
                      minLayer: 93,
                      maxLayer: 93,
                      libraryVersions: ['2'],
                      udpP2p: true,
                    //   udpReflector: true,
                    }),
                    video: true,
                })
        )
        //@ts-ignore
        console.log(new Api.InputPhoneCall({
                    
          //@ts-ignore
          id: returnBigInt(call.phoneCall.id.value ),
          //@ts-ignore
          accessHash: returnBigInt(call.phoneCall.accessHash.value) ,
      }),)


        await this.client.invoke(
            new Api.phone.AcceptCall(    new Api.phone.AcceptCall({
                peer: new Api.InputPhoneCall({
                    
                    //@ts-ignore
                    id: returnBigInt(call.phoneCall.id.value ) ,
                    //@ts-ignore
                    accessHash: returnBigInt(call.phoneCall.accessHash.value),
                }),
                // @ts-ignore
                gB:   publicKey,
                // gB: Buffer.from(int_256_to_bytes(BigInt(gB) )),
                protocol: new Api.PhoneCallProtocol({
                    minLayer: 93,
                    maxLayer: 93,
                    libraryVersions: ['2'],
                    udpP2p: true,
                }),
              }))
        )
        return call
    }

 

    
}
