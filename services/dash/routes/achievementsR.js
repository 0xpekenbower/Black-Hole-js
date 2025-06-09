import ach from '../controllers/achievementsC.js'

const achievements = (fastify, options, done) => {

    fastify.post('/api/dash/add-achievements/', ach.add_achievementsC)
    fastify.post('/api/dash/update-achievements/', ach.update_achievementsC)
    fastify.get('/api/dash/my-achievements/', ach.list_achievementsC)

    done()
}

export default achievements