const { get } = require('axios')

const API_URL = 'https://api.www.root-me.org'

class RootMe {

    constructor(session) {
        this.session = session
    }

    async query(endpoint, data = {}) {
        return (await get(API_URL + endpoint, {
            withCredentials: true,
            params: data,
            headers: this.session ? { 'Cookie': 'spip_session=' + this.session } : {}
        })).data
    }

    async login(login, password) {
        this.session = (await this.query('/login', {
            login: login,
            password: password
        }))[0].info.spip_session
    }

    async getChallenges(title = '', subtitle = '', lang = 'fr', score = '') {
        return Object.values((await this.query('/challenges', {
            titre: title,
            soustitre: subtitle,
            lang: lang,
            score: score
        }))[0])
    }

    async getChallengeById(id) {
        return await this.query('/challenges/' + id)
    }

    async getChallengeId(title = '', offset = 0, subtitle = '', lang = 'fr', score = '') {
        return (await this.getChallenges(title, subtitle, lang, score))[offset].id_challenge
    }

    async getChallengeByName(title, offset = 0) {
        return await this.getChallenges(await this.getChallengeId(title, offset))
    }

    async getUsers(username = '', status = '', lang = '') {
        return Object.values((await this.query('/auteurs', {
            nom: username,
            statut: status,
            lang: lang
        }))[0])
    }

    async getUserById(id) {
        return await this.query('/auteurs/' + id)
    }

    async getUserId(username = '', offset = 0, lang = '', status = '') {
        return (await this.getUsers(username, status, lang))[offset].id_auteur
    }

    async getUserByName(username, offset = 0) {
        return await this.getUserById(await this.getUserId(username, offset))
    }

    async searchUser(username, offset) {
        try {
            let users = await this.getUsers(username)
            
            let foundUsers = []
            for(let user of users) {
                if(user.nom === username) {
                    foundUsers.push(await this.getUserById(user.id_auteur))
                }
            }
            if(offset) return foundUsers[offset]
            else return foundUsers.length === 1 ? foundUsers[0] : foundUsers
        } catch {
            return undefined
        }
    }

    async getCurrentUser() {
        return await this.getUserById(this.session.split('_')[0])
    }

    async getLeaderboard(startRank = 0) {
        return await this.query('/classement', {
            debut_classement: startRank
        })
    }

    async getVirtualEnvironnements(name = '', os = '', offset = 0) {
        return Object.values((await this.query('/environnements_virtuels', {
            nom: name,
            os: os,
            debut_environnements_virtuels: offset
        }))[0])
    }

    async getAllVirtualEnvironnements() {
        let virtualenvs = []
        for (let virtualenv of (await this.getVirtualEnvironnements())) {
            virtualenvs.push(await this.getVirtualEnvironnementById(virtualenv.id_environnement_virtuel))
        }
        return virtualenvs
    }

    async getVirtualEnvironnementById(id) {
        return await this.query('/environnements_virtuels/' + id)
    }

    async getVirtualEnvironnementId(name = '', offset = 0, os = '') {
        return (await this.getVirtualEnvironnements(name, os))[offset].id_environnement_virtuel
    }

    async getVirtualEnvironnementByName(name, offset = 0) {
        return await this.getVirtualEnvironnementById(await this.getVirtualEnvironnementId(name, offset))
    }

}

module.exports = RootMe