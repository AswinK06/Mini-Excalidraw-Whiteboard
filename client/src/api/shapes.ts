import axios from 'axios'
import { Shape } from '../types/Shape'
const API = 'http://localhost:5000/api'
export const fetchShapes = async () => (await axios.get(API + '/shapes')).data as Shape[]
export const postShape = async (s: Shape) => (await axios.post(API + '/shapes', s)).data
export const putShape = async (id: string, body: Partial<Shape>) => (await axios.put(API + '/shapes/' + id, body)).data
export const deleteShape = async (id: string) => (await axios.delete(API + '/shapes/' + id)).data
export const fetchPages = async () => (await axios.get(API + '/pages')).data
export const postPage = async (name: string) => (await axios.post(API + '/pages', { name })).data
export const fetchPageShapes = async (id: string) => (await axios.get(API + '/pages/' + id + '/shapes')).data
