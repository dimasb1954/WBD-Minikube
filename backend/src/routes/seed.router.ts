import express from 'express';
import { exec } from 'child_process';

const router = express.Router();

router.get('/', (req, res) => {
    exec('npm run seed', (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send(`Seeding gagal : ${error}`);
        }
        console.log(`Error: ${stdout}`);
        console.error(`Error: ${stderr}`);
        res.send('Seeding succeeded');
    });
});

router.get('/prune', (req, res) => {
   exec ('npm run prunedb', (error, stdout, stderr) => {
          if (error) {
              return res.status(500).send(`Pruning gagal : ${error}`);
          }
          console.log(`Error: ${stdout}`);
          console.error(`Error: ${stderr}`);
          res.send('Pruning succeeded');
   });
});

export default router;