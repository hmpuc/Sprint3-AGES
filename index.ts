import express from 'express'
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = 3011;

app.use(express.json());

app.get('/', async (req, res) => {
    const answer = `Para criar acessar os filmes: /film | Para acessar as reviews de um filme /review/{nomedofilme} |`
    res.send(answer);
});

app.get('/film', async (req, res) => {
    try {
        const films = await prisma.film.findMany();

        if (films.length > 0) {
          res.json(films);
        } else {
          res.status(404).json({ error: 'Nenhum filme adicionado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar filmes' });
    }
});

app.post('/film/add', async (req, res) => {
    try {
        if (!req.body.title) {
            res.status(400).json();
        } else {
            const filme = await prisma.film.create({
                data: {
                    title: req.body.title
                }
            })
            if (filme) {
                res.status(201).json(filme); 
            } else {
                res.status(404).json({ error: 'Ocorreu um erro ao adicionar o filme' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar filmes' });
    }
});

app.post('/film/delete', async (req, res) => {
    try {
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar filmes' });
    }
});

app.put('/film/edit', async (req, res) => {
    try {
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao editar filmes' });
    }
});

app.get('/review/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const reviews = await prisma.review.findMany({
          where: {
            film: {
              title: {
                equals: id,
              },
            },
          },
        });
    
        if (reviews.length > 0) {
          res.json(reviews);
        } else {
          res.status(404).json({ error: 'Nenhuma avaliação encontrada para este filme ou ele não existe' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar avaliações' });
    }
});

app.post('/review/add', async (req, res) => {
    try {
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar filmes' });
    }
});

app.post('/review/delete', async (req, res) => {
    try {
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar filmes' });
    }
});

app.put('/review/edit', async (req, res) => {
    try {
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao editar filmes' });
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});