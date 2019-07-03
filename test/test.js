import {expect} from 'chai';
import config from  '../app/config/config';
import server from '../bin/www';
console.log(server.port)

describe('Server', ()=>{
    it('tests that server is running current port', async()=>{
        expect(server.port).to.equal(config.server.port)
   
    })
});