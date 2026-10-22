import { beforeEach, describe, expect, it } from 'vitest'
import { cursoDermoconsejera as curso } from '@/mocks/seed'
import { getProgreso } from '@/lib/progress-store'
import { getSesion } from '@/lib/session-store'
import type { IndiceRespuesta } from '@/types/domain'
import {
  Bloqueado,
  cambiarContrasena,
  ContrasenaActualIncorrecta,
  CredencialesInvalidas,
  enviarIntento,
  getCapitulo,
  getCurso,
  getCursosAsignados,
  getMaterial,
  getTest,
  login,
  logout,
  marcarMaterialVisto,
  NoAutenticado,
  NoEncontrado,
  usuarioActual,
} from './index'
import { aplicarPreset, reiniciarDemo } from './demo'

const EMAIL = 'lucia.fernandez@email.com'

describe('auth', () => {
  it('credenciales erróneas lanzan CredencialesInvalidas', async () => {
    await expect(login(EMAIL, 'otra')).rejects.toBeInstanceOf(CredencialesInvalidas)
    await expect(login('nadie@email.com', 'provisional')).rejects.toBeInstanceOf(CredencialesInvalidas)
    expect(getSesion()).toBeNull()
  })

  it('el primer acceso exige cambiar la contraseña provisional', async () => {
    const usuario = await login(' Lucia.Fernandez@email.com ', 'provisional')

    expect(usuario.mustChangePassword).toBe(true)
    expect(getSesion()).toEqual({ usuarioId: usuario.id })
  })

  it('tras cambiarla, la nueva contraseña sirve y la provisional no', async () => {
    await login(EMAIL, 'provisional')
    await cambiarContrasena('Eucerin2026')
    expect(usuarioActual()?.mustChangePassword).toBe(false)

    await logout()
    await expect(login(EMAIL, 'provisional')).rejects.toBeInstanceOf(CredencialesInvalidas)
    await expect(login(EMAIL, 'Eucerin2026')).resolves.toMatchObject({ mustChangePassword: false })
  })

  it('desde Perfil hay que dar la contraseña actual', async () => {
    await login(EMAIL, 'provisional')
    await cambiarContrasena('Eucerin2026')

    await expect(cambiarContrasena('Otra2026', 'mal')).rejects.toBeInstanceOf(ContrasenaActualIncorrecta)
    await expect(cambiarContrasena('Otra2026', 'Eucerin2026')).resolves.toBeDefined()
  })

  it('reiniciar la demo vuelve a la contraseña provisional y cierra sesión', async () => {
    await login(EMAIL, 'provisional')
    await cambiarContrasena('Eucerin2026')
    reiniciarDemo()

    expect(getSesion()).toBeNull()
    await expect(login(EMAIL, 'provisional')).resolves.toMatchObject({ mustChangePassword: true })
  })
})

describe('cursos', () => {
  it('sin sesión lanza NoAutenticado', async () => {
    await expect(getCursosAsignados()).rejects.toBeInstanceOf(NoAutenticado)
  })

  describe('con sesión', () => {
    beforeEach(async () => {
      await login(EMAIL, 'provisional')
    })

    it('devuelve solo los cursos asignados', async () => {
      expect((await getCursosAsignados()).map((c) => c.id)).toEqual(['dermoconsejera'])
      await expect(getCurso('otro')).rejects.toBeInstanceOf(NoEncontrado)
    })

    it('un capítulo bloqueado lanza Bloqueado', async () => {
      await expect(getCapitulo(curso.id, 'cap-2')).rejects.toBeInstanceOf(Bloqueado)
      await expect(getCapitulo(curso.id, 'cap-1')).resolves.toMatchObject({ id: 'cap-1' })
      await expect(getCapitulo(curso.id, 'cap-9')).rejects.toBeInstanceOf(NoEncontrado)
    })

    it('el material devuelve su posición en el capítulo', async () => {
      const { indice, capitulo } = await getMaterial(curso.id, 'cap-1', 'cap-1-video')
      expect(indice).toBe(2)
      expect(capitulo.materiales).toHaveLength(4)
    })

    it('el test se abre al ver todos los materiales', async () => {
      aplicarPreset('capitulo-2-a-medias')
      await expect(getTest(curso.id, 'cap-2')).rejects.toBeInstanceOf(Bloqueado)

      await marcarMaterialVisto(curso.id, 'cap-2', 'cap-2-video')
      await marcarMaterialVisto(curso.id, 'cap-2', 'cap-2-audio')
      await expect(getTest(curso.id, 'cap-2')).resolves.toMatchObject({ id: 'cap-2-test' })
    })

    it('no se puede marcar un material de otro capítulo', async () => {
      await expect(marcarMaterialVisto(curso.id, 'cap-1', 'cap-2-pdf')).rejects.toBeInstanceOf(
        NoEncontrado,
      )
    })

    it('enviar un intento lo corrige y lo registra en el progreso', async () => {
      aplicarPreset('capitulo-2-a-medias')
      await marcarMaterialVisto(curso.id, 'cap-2', 'cap-2-video')
      await marcarMaterialVisto(curso.id, 'cap-2', 'cap-2-audio')
      const test = await getTest(curso.id, 'cap-2')
      const respuestas = test.preguntas.map((p) => p.correcta) as IndiceRespuesta[]

      const { intento, correccion } = await enviarIntento(curso.id, 'cap-2', 'int-1', respuestas)

      expect(correccion.superado).toBe(true)
      expect(intento).toMatchObject({ id: 'int-1', testId: 'cap-2-test', porcentaje: 100 })
      expect(getProgreso(curso.id).intentos['cap-2-test']).toHaveLength(1)
      await expect(getCapitulo(curso.id, 'cap-3')).resolves.toMatchObject({ contenidoPendiente: true })
    })

    it('el test final está bloqueado hasta superar los capítulos', async () => {
      await expect(getTest(curso.id, null)).rejects.toBeInstanceOf(Bloqueado)
    })
  })
})
