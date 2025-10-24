# Arquitectura de Pools de Semilla

## Visión General

Semilla usa el **patrón Factory** para permitir múltiples pools de lending independientes. Cada pool es un ecosistema autónomo donde prestamistas y prestatarios interactúan directamente, con parámetros personalizables como tipo de activo, tasas de interés y términos de préstamo.

## ¿Por qué Múltiples Pools?

Los protocolos de lending tradicionales tienen un único pool para todos. El enfoque de Semilla:

- **Pools comunitarios**: Cualquiera puede crear un pool para su comunidad
- **Parámetros personalizables**: Cada dueño decide tasas, riesgo y términos
- **Riesgo aislado**: Los defaults de un pool no afectan a otros
- **Sin permisos**: No hay autoridad central controlando quién crea pools

## Componentes del Pool

### 1. **Factory Contract** (`LendingFactory.sol`)
- Deploya nuevas instancias de `LendingPool`
- Registra pools en `PoolRegistry`
- Gestiona configuración de pools

### 2. **Pool Registry** (`PoolRegistry.sol`)
- Almacena metadata de pools (nombre, logo, tipo de activo, dueño)
- Permite descubrimiento de pools
- Rastrea pools activos vs inactivos

### 3. **Lending Pool** (`LendingPool.sol`)
- Instancia individual del pool
- Maneja depósitos, retiros, préstamos, reembolsos
- Calcula distribución de intereses
- Gestiona verificación de identidad para prestatarios

## Flujo de Pool: Ejemplo Práctico

### Escenario: Pool Comunitario "Microcrédito Lima"

**Paso 1: Creación del Pool**
```
María (dueña del pool) crea un pool:
- Nombre: "Microcrédito Lima"
- Activo: USDC (estable, predecible)
- Tasa de Interés: 8% APR
- Jury: Miembros de comunidad de Lima
- Cobertura RIF: 20% (fondo de seguro)
```

**Paso 2: Prestamistas Depositan**
```
Alice deposita 1,000 USDC
Bob deposita 500 USDC
Carlos deposita 2,500 USDC
→ Liquidez del pool: 4,000 USDC
```

**Paso 3: Distribución de Capital e Intereses**
```
Intereses anuales del 8% APR:
4,000 USDC × 8% = 320 USDC/año

Distribución:
- 70% → Prestamistas (Alice, Bob, Carlos): 224 USDC
- 20% → Fondo RIF (seguro): 64 USDC
- 10% → Protocolo (Semilla): 32 USDC
```

**Paso 4: Prestatario Solicita Préstamo**
```
Juan (necesita dinero para suministros de negocio):
1. Verifica identidad con ZK Proof (sin documentos formales)
2. Jury revisa solicitud
3. Préstamo aprobado: 1,000 USDC @ 8% por 6 meses
4. Juan recibe 1,000 USDC inmediatamente

Términos:
- Interés adeudado: 1,000 × 8% × 0.5 = 40 USDC
- Total a reembolsar: 1,040 USDC en 6 meses
```

**Paso 5: Acumulación de Intereses**
```
Mes 1: 1,000 USDC generando 8% APR
  Tasa mensual = 8% / 12 = 0.67%
  Intereses generados = 1,000 × 0.67% = 6.70 USDC
  
→ Los intereses se dividen nuevamente 70/20/10
  Prestamistas obtienen: 4.69 USDC
  Fondo RIF obtiene: 1.34 USDC
  Protocolo obtiene: 0.67 USDC
```

**Paso 6: Reembolso del Préstamo**
```
Después de 6 meses, Juan reembolsa 1,040 USDC
1. 1,000 USDC principal regresa al pool
2. 40 USDC de interés se distribuyen:
   - 28 USDC a prestamistas (70%)
   - 8 USDC a RIF (20%)
   - 4 USDC a Semilla (10%)
3. El pool ahora tiene 5,000 USDC (4,000 + 1,000 reembolsado)
4. Ganancia de prestamistas: 224 + 28 = 252 USDC en intereses
```

## Activos Soportados (MVP)

| Activo | Red | Caso de Uso |
|--------|-----|-------------|
| **USDC** | Scroll Sepolia | Stablecoin, tasas predecibles |
| **USX** | Scroll nativo | Alternativa stablecoin local |
| **ETH** | Scroll nativo | Lending de ETH directo (experimental) |
| **weETH** | Scroll (via bridge) | Futuro: generación de yield |

## Responsabilidades del Dueño del Pool

1. **Establecer términos**: Tasas de interés, duración del préstamo, tamaño máximo por nivel
2. **Gestionar jury**: Seleccionar miembros de comunidad confiables para aprobación
3. **Monitorear defaults**: Rastrear préstamos vencidos
4. **Actualizar metadata**: Nombre del pool, logo, documentación

## Beneficios Clave

✅ **Descentralizado**: Sin puertas de banco gatekeeping
✅ **Impulsado por comunidad**: Dueños de pools conocen a sus prestatarios
✅ **Transparente**: Todas las transacciones en cadena
✅ **Flexible**: Cada pool se personaliza para su mercado
✅ **Seguro**: Múltiples pools = riesgo aislado

## Consideraciones de Seguridad

- Cada pool es independiente (sin contagio)
- Sistema de jury previene lending arbitrario
- ZK Proofs verifican identidad sin exponer datos personales
- ReentrancyGuard protege contra ataques
- Fondo RIF proporciona seguro de default

## Mejoras Futuras

- [ ] Gobernanza multi-sig para decisiones del pool
- [ ] Intercambios de liquidez entre pools
- [ ] Integración de creador de mercado automatizado (AMM)
- [ ] Soporte de colateral (NFTs, activos off-chain)
- [ ] Optimización de yield con weETH
