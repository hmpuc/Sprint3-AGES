import express from 'express'
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = 3000;

app.use(express.json());

app.get('/', async (req, res) => {
    const answer = `Para acessar os filmes: /filmes | Para acessar as avaliações de um filme /review/{tituloDoFilme} | Para gerenciar filmes: /filmes/adicionar, /filmes/deletar e /filmes/editar | Para gerenciar avaliações: /review/adicionar, /review/deletar e /review/editar`
    res.json(answer);
});

app.get('/filmes', async (req, res) => {
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

app.post('/filmes/adicionar', async (req, res) => {
    try {
        if (!req.body.title) {
            res.status(400).json('Nenhum título informado');
        } else {
            const filme = await prisma.film.findUnique({
                where: {
                    title: req.body.title
                }
            })
            if (filme) {
                res.status(400).json('O filme já existe');
            } else {
                const novoFilme = await prisma.film.create({
                    data: {
                        title: req.body.title
                    }
                })
                if (novoFilme) {
                    res.status(201).json(novoFilme); 
                } else {
                    res.status(500).json({ error: 'Ocorreu um erro ao adicionar o filme' });
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar filmes' });
    }
});

app.delete('/filmes/deletar', async (req, res) => {
    try {
        if (!req.body.id) {
            res.status(400).json('Nenhum id informado');
        } else {
            await prisma.$transaction([
                prisma.review.deleteMany({
                    where: {
                        filmId: req.body.id,
                    },
                }),
                prisma.film.delete({
                    where: {
                        id: req.body.id,
                    },
                }),
            ])

            res.status(200).json('Filme deletado')

        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar filmes' });
    }
});

app.put('/filmes/editar', async (req, res) => {
    try {
        if (!req.body.id || !req.body.title) {
            res.status(400).json('Id ou título não foram fornecidos'); 
        } else {
            const filme = await prisma.film.findUnique({
                where: {
                    id: req.body.id
                }
            })
            if (!filme) {
                res.status(400).json('Id não corresponde a nenhum filme'); 
            } else {
                const updateFilme = await prisma.film.update({
                    where: { 
                        id: req.body.id
                    }, 
                    data: { 
                        title: req.body.title 
                    } 
                })

                const updateReview = await prisma.review.updateMany({
                    where: {
                        filmId: filme.id
                    },
                    data: {
                        film: req.body.title
                    }
                })
    
                res.status(200).json(updateFilme);
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao editar filme' }); 
    }
});

app.get('/review/:titulo', async (req, res) => {
    const titulo = req.params.titulo;
    try {
        const reviews = await prisma.review.findMany({
            where: {
                film: {
                    title: {
                        equals: titulo,
                    },
                },
            },
            include: {
                film: true
            }
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

app.post('/review/adicionar', async (req, res) => {
    try {
        if (!req.body.title || !req.body.content || req.body.rating || req.body.author || req.body.film) {
            res.status(400).json('Não foi informado filme, autor, título, conteúdo ou avaliação');
        } else {
            const filme = await prisma.film.findUnique({
                where: {
                    title: req.body.film
                }
            })
            if (!filme) {
                res.status(400).json('Não há filme com esse nome');
            } else {
                const review = await prisma.review.findUnique({
                    where: {
                        film: req.body.film,
                        author: req.body.author,
                    }
                })
                if (review) {
                    res.status(400).json('Esse autor já tem um avaliação para esse filme');
                } else {
                    if (req.body.rating > 10 || req.body.rating < 0) {
                        res.status(400).json('A nota da avaliação é inválida');
                    }
                    const novaReview = await prisma.review.create({
                        data: {
                            film: req.body.film,
                            title: req.body.title,
                            author: req.body.author,
                            content: req.body.content,
                            rating: req.body.rating,
                        }
                    })
                    await prisma.film.update({
                        where: {
                            id: filme.id,
                        },
                        data: {
                            rating: (filme.rating * filme.numberReviews + req.body.rating) / (filme.numberReviews + 1),
                            numberReviews: filme.numberReviews + 1,
                        }
                    })

                    if (novaReview) {
                        res.status(201).json(novaReview); 
                    } else {
                        res.status(404).json({ error: 'Ocorreu um erro ao adicionar a avaliação' });
                    }
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar avaliação' });
    }
});

app.delete('/review/deletar', async (req, res) => {
    try {
        if (!req.body.id) {
            res.status(400).json('Nenhum id informado');
        } else {
            const review = await prisma.review.delete({
                where: {
                    id: req.body.id
                }
            })
            const filme = await prisma.film.find({
                where: {
                    title: review.film
                }
            })

            if (filme.numberReviews > 1) {
                await prisma.film.update({
                    where: {
                        id: filme.id,
                    },
                    data: {
                        rating: (filme.rating * filme.numberReviews - review.rating) / (filme.numberReviews - 1),
                        numberReviews: filme.numberReviews + 1,
                    }
                })
            } else {
                await prisma.film.update({
                    where: {
                        id: filme.id,
                    },
                    data: {
                        rating: 0,
                        numberReviews: 0,
                    }
                })
            }

            res.status(200).json('Avaliação deletada')

        }   
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar avaliação' });
    }
});

app.put('/review/editar', async (req, res) => {
    try {
        if (!req.body.id) {
            res.status(400).json('Nenhum id informado');
        } else {
            if (!req.body.title && !req.body.rating && !req.body.content) {
                res.status(400).json('Precisa ter algum item para mudar');
            } else {
                if (req.body.rating && (req.body.rating > 10 || req.body.rating < 0)) {
                    res.status(400).json('A nota da avaliação é inválida');
                } else {
                    const review = await prisma.review.findUnique({
                        where: {
                            id: req.body.id
                        }
                    })
                    const updateReview = await prisma.review.update({
                        where: {
                            id: req.body.id
                        },
                        data: {
                            title: req.body.title ?? review.title,
                            content: req.body.content ?? review.content,
                            rating: req.body.rating ?? review.rating
                        }
                    })
                    if (req.body.rating) {
                        const filme = await prisma.film.findUnique({
                            where: {
                                id: review.filmId
                            }
                        })
                        const updateFilme = await prisma.film.update({
                            where: {
                                id: review.filmId
                            },
                            data: {
                                rating: (filme.rating * filme.numberReviews - review.rating + req.body.rating) / filme.numberReviews
                            }
                        })
                    }
                    res.status(200).json(updateReview);
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao editar avaliação' });
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});